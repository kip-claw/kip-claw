#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);

const HELP = `Usage:
  npm run milkdrop -- --input <url-or-file> --output renders/clip.mp4 [options]

Options:
  --input       YouTube/audio URL or local audio/video file
  --output      Output MP4 path
  --duration    Clip length in seconds, default 30
  --start       Start offset in seconds, default 0
  --width       Canvas width, default 1080
  --height      Canvas height, default 1920
  --fps         Frames per second, default 30
  --preset      Preset name, index, or "random", default random
  --keep-temp   Keep intermediate files for inspection
  --help        Show this message

Requires ffmpeg and ffprobe. Remote URLs also require yt-dlp. Run
"npx playwright install chromium" once if Chromium is not installed.`;

const DEFAULTS = {
	duration: 30,
	start: 0,
	width: 1080,
	height: 1920,
	fps: 30,
	preset: 'random'
};

function parseArgs(argv) {
	const options = { ...DEFAULTS, keepTemp: false };
	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		if (arg === '--help' || arg === '-h') {
			options.help = true;
			continue;
		}
		if (arg === '--keep-temp') {
			options.keepTemp = true;
			continue;
		}
		if (!arg.startsWith('--')) {
			throw new Error(`Unexpected argument: ${arg}`);
		}
		const key = arg.slice(2);
		const value = argv[i + 1];
		if (!value || value.startsWith('--')) {
			throw new Error(`Missing value for ${arg}`);
		}
		i += 1;
		options[key] = value;
	}

	for (const key of ['duration', 'start', 'width', 'height', 'fps']) {
		options[key] = Number(options[key]);
		if (
			!Number.isFinite(options[key]) ||
			(key === 'start' ? options[key] < 0 : options[key] <= 0)
		) {
			throw new Error(
				key === 'start' ? '--start must be zero or greater' : `--${key} must be a positive number`
			);
		}
	}

	if (!options.input && !options.help) throw new Error('--input is required');
	if (!options.output && !options.help) throw new Error('--output is required');
	return options;
}

function isRemoteInput(input) {
	return /^https?:\/\//i.test(input);
}

function run(command, args, options = {}) {
	return new Promise((resolveRun, rejectRun) => {
		const child = spawn(command, args, {
			stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
			...options.spawn
		});
		let stdout = '';
		let stderr = '';
		if (child.stdout) child.stdout.on('data', (chunk) => (stdout += chunk));
		if (child.stderr) child.stderr.on('data', (chunk) => (stderr += chunk));
		child.on('error', rejectRun);
		child.on('close', (code) => {
			if (code === 0) {
				resolveRun({ stdout, stderr });
				return;
			}
			rejectRun(new Error(`${command} exited with ${code}${stderr ? `\n${stderr}` : ''}`));
		});
	});
}

async function assertBinary(command, hint) {
	try {
		await run(command, ['-version'], { capture: true });
	} catch {
		throw new Error(`${command} is required. ${hint}`);
	}
}

async function assertYtDlp() {
	try {
		await run('yt-dlp', ['--version'], { capture: true });
	} catch {
		throw new Error('yt-dlp is required for remote URLs. Install it with "brew install yt-dlp".');
	}
}

async function downloadRemoteAudio(input, dir) {
	const template = join(dir, 'source.%(ext)s');
	await run('yt-dlp', [
		'--no-playlist',
		'--extract-audio',
		'--audio-format',
		'wav',
		'--audio-quality',
		'0',
		'--output',
		template,
		input
	]);

	const files = await readdir(dir);
	const downloaded = files.find((file) => file.startsWith('source.'));
	if (!downloaded) throw new Error('yt-dlp did not produce an audio file.');
	return join(dir, downloaded);
}

async function normalizeAudio(input, output, start) {
	await run('ffmpeg', [
		'-y',
		'-ss',
		String(start),
		'-i',
		input,
		'-vn',
		'-ac',
		'2',
		'-ar',
		'44100',
		'-sample_fmt',
		's16',
		output
	]);
}

function contentType(filePath) {
	if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
	if (filePath.endsWith('.wav')) return 'audio/wav';
	if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
	return 'application/octet-stream';
}

function startStaticServer(root) {
	const server = createServer((request, response) => {
		const url = new URL(request.url || '/', 'http://127.0.0.1');
		const relativePath = normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/, '');
		const filePath = resolve(root, relativePath || 'renderer.html');
		if (!filePath.startsWith(`${root}${sep}`) && filePath !== root) {
			response.writeHead(403);
			response.end('Forbidden');
			return;
		}

		const stream = createReadStream(filePath);
		stream.on('error', () => {
			response.writeHead(404);
			response.end('Not found');
		});
		response.writeHead(200, { 'Content-Type': contentType(filePath) });
		stream.pipe(response);
	});

	return new Promise((resolveServer, rejectServer) => {
		server.on('error', rejectServer);
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			if (!address || typeof address === 'string') {
				rejectServer(new Error('Could not start local render server.'));
				return;
			}
			resolveServer({
				url: `http://127.0.0.1:${address.port}`,
				close: () =>
					new Promise((resolveClose, rejectClose) => {
						server.close((error) => (error ? rejectClose(error) : resolveClose()));
					})
			});
		});
	});
}

async function renderWebm({ audioPath, outputPath, duration, width, height, fps, preset }) {
	const butterchurnPath = require.resolve('butterchurn');
	const presetsPath = require.resolve('butterchurn-presets');
	const rendererPath = join(dirname(outputPath), 'renderer.html');
	const serverRoot = dirname(outputPath);
	const localServer = await startStaticServer(serverRoot);
	const browser = await chromium.launch({
		args: ['--autoplay-policy=no-user-gesture-required']
	});

	try {
		await writeFile(
			rendererPath,
			`
			<!doctype html>
			<html>
				<body style="margin:0;background:#000;overflow:hidden">
					<canvas id="visualizer" width="${width}" height="${height}" style="width:${width}px;height:${height}px"></canvas>
					<audio id="audio" src="/${basename(audioPath)}"></audio>
				</body>
			</html>
		`
		);
		const page = await browser.newPage({
			viewport: { width, height },
			deviceScaleFactor: 1
		});
		await page.goto(`${localServer.url}/renderer.html`);
		await page.addScriptTag({ path: butterchurnPath });
		await page.addScriptTag({ path: presetsPath });
		await page.exposeFunction('saveMilkdropRecording', async (base64) => {
			await writeFile(outputPath, Buffer.from(base64, 'base64'));
		});

		await page.evaluate(
			async ({
				duration: clipDuration,
				width: renderWidth,
				height: renderHeight,
				fps: frameRate,
				preset: presetChoice
			}) => {
				const canvas = document.querySelector('#visualizer');
				const audio = document.querySelector('#audio');
				await new Promise((resolve, reject) => {
					if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
						resolve();
						return;
					}
					audio.oncanplay = resolve;
					audio.onerror = () => reject(new Error('Audio file could not be loaded by Chromium.'));
					audio.load();
				});
				if (!audio.captureStream) {
					throw new Error('Chromium does not support audio.captureStream().');
				}
				const AudioContextClass = window.AudioContext || window.webkitAudioContext;
				const audioContext = new AudioContextClass();
				const source = audioContext.createMediaElementSource(audio);
				const butterchurn = window.butterchurn.createVisualizer
					? window.butterchurn
					: window.butterchurn.default;
				const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
					width: renderWidth,
					height: renderHeight,
					pixelRatio: 1,
					textureRatio: 1
				});
				visualizer.connectAudio(source);
				source.connect(audioContext.destination);

				const presets = window.butterchurnPresets.getPresets();
				const presetNames = Object.keys(presets);
				const presetName =
					presetChoice === 'random'
						? presetNames[Math.floor(Math.random() * presetNames.length)]
						: presetNames[Number(presetChoice)] || presetChoice;
				const selectedPreset = presets[presetName];
				if (!selectedPreset) throw new Error(`Preset not found: ${presetChoice}`);
				visualizer.loadPreset(selectedPreset, 0);

				const canvasStream = canvas.captureStream(frameRate);
				const audioStream = audio.captureStream();
				const stream = new MediaStream([
					...canvasStream.getVideoTracks(),
					...audioStream.getAudioTracks()
				]);
				const recorder = new MediaRecorder(stream, {
					mimeType: 'video/webm;codecs=vp9,opus',
					videoBitsPerSecond: 9000000
				});
				const chunks = [];
				recorder.ondataavailable = (event) => {
					if (event.data.size > 0) chunks.push(event.data);
				};

				let running = true;
				const draw = () => {
					if (!running) return;
					visualizer.render();
					requestAnimationFrame(draw);
				};

				const stopped = new Promise((resolve) => {
					recorder.onstop = resolve;
				});
				recorder.start(1000);
				await audioContext.resume();
				await audio.play();
				requestAnimationFrame(draw);
				await new Promise((resolve) => setTimeout(resolve, clipDuration * 1000));
				running = false;
				audio.pause();
				recorder.stop();
				await stopped;

				const blob = new Blob(chunks, { type: 'video/webm' });
				const buffer = await blob.arrayBuffer();
				let binary = '';
				const bytes = new Uint8Array(buffer);
				for (let i = 0; i < bytes.length; i += 0x8000) {
					binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
				}
				await window.saveMilkdropRecording(btoa(binary));
				return { presetName };
			},
			{ duration, width, height, fps, preset }
		);
	} finally {
		await browser.close();
		await localServer.close();
	}
}

async function transcodeMp4(webmPath, outputPath) {
	await run('ffmpeg', [
		'-y',
		'-i',
		webmPath,
		'-c:v',
		'libx264',
		'-preset',
		'slow',
		'-crf',
		'18',
		'-pix_fmt',
		'yuv420p',
		'-c:a',
		'aac',
		'-b:a',
		'192k',
		'-movflags',
		'+faststart',
		outputPath
	]);
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		console.log(HELP);
		return;
	}

	await assertBinary('ffmpeg', 'Install it with "brew install ffmpeg".');
	await assertBinary('ffprobe', 'Install it with "brew install ffmpeg".');
	if (isRemoteInput(options.input)) await assertYtDlp();

	const outputPath = resolve(options.output);
	const tempDir = await mkdtemp(join(tmpdir(), 'kip-milkdrop-'));
	const normalizedAudio = join(tempDir, 'audio.wav');
	const webmPath = join(tempDir, `${basename(outputPath, extname(outputPath))}.webm`);

	try {
		const sourceAudio = isRemoteInput(options.input)
			? await downloadRemoteAudio(options.input, tempDir)
			: resolve(options.input);
		await normalizeAudio(sourceAudio, normalizedAudio, options.start);
		await mkdir(dirname(outputPath), { recursive: true });
		await renderWebm({
			audioPath: normalizedAudio,
			outputPath: webmPath,
			duration: options.duration,
			width: options.width,
			height: options.height,
			fps: options.fps,
			preset: options.preset
		});
		await transcodeMp4(webmPath, outputPath);
		console.log(`Wrote ${outputPath}`);
	} finally {
		if (options.keepTemp) {
			console.log(`Kept temporary files in ${tempDir}`);
		} else {
			await rm(tempDir, { recursive: true, force: true });
		}
	}
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
