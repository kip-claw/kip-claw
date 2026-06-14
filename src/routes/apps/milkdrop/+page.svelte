<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { PageCopy } from '$lib/copy';
	import copyData from './copy.yaml';

	type Profile = {
		key: string;
		label: string;
		width: number;
		height: number;
	};

	type RecorderState = 'idle' | 'loading' | 'ready' | 'recording' | 'complete' | 'error';

	type ButterchurnVisualizer = {
		connectAudio: (node: AudioNode) => void;
		loadPreset: (preset: unknown, blendTime?: number) => void;
		render: () => void;
		setRendererSize: (width: number, height: number) => void;
	};

	type ButterchurnModule = {
		createVisualizer?: (
			context: AudioContext,
			canvas: HTMLCanvasElement,
			options: Record<string, unknown>
		) => ButterchurnVisualizer;
		default?: ButterchurnModule;
	};

	type ButterchurnPresetsModule = {
		getPresets?: () => Record<string, unknown>;
		default?: ButterchurnPresetsModule;
	};

	const copy = copyData as PageCopy;

	const profiles: Profile[] = [
		{ key: 'square', label: 'Square 1:1', width: 1080, height: 1080 },
		{ key: 'vertical', label: 'Vertical 9:16', width: 1080, height: 1920 },
		{ key: 'landscape', label: 'Landscape 16:9', width: 1920, height: 1080 }
	];

	let canvasEl: HTMLCanvasElement;
	let audioEl: HTMLAudioElement;
	let audioContext: AudioContext | undefined;
	let sourceNode: MediaElementAudioSourceNode | undefined;
	let visualizer: ButterchurnVisualizer | undefined;
	let animationFrame = 0;
	let sourceObjectUrl = '';
	let downloadUrl = $state('');
	let downloadName = $state('milkdrop-social.webm');
	let selectedFiles = $state<FileList>();
	let selectedFileKey = '';
	let fileName = $state('');
	let outputName = $state('milkdrop-social.webm');
	let presetNames = $state<string[]>([]);
	let duration = $state(30);
	let start = $state(0);
	let fps = $state(30);
	let profileKey = $state('square');
	let preset = $state('random');
	let status = $state<RecorderState>('idle');
	let message = $state('Choose an audio file to start.');
	let presetsCache: Record<string, unknown> | undefined;

	const selectedProfile = $derived(profiles.find((p) => p.key === profileKey) ?? profiles[0]);
	const canRecord = $derived(!!fileName && status !== 'loading' && status !== 'recording');
	const canvasStyle = $derived(
		`aspect-ratio: ${selectedProfile.width} / ${selectedProfile.height};`
	);

	$effect(() => {
		const file = selectedFiles?.[0];
		if (!file) return;
		const fileKey = `${file.name}:${file.size}:${file.lastModified}`;
		if (fileKey === selectedFileKey) return;
		selectedFileKey = fileKey;
		loadFile(file);
	});

	onMount(() => {
		void loadPresetNames();
	});

	function getAudioContext() {
		if (!audioContext) {
			const audioWindow = window as Window & {
				webkitAudioContext?: typeof AudioContext;
			};
			const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
			if (!AudioContextClass) {
				throw new Error('This browser does not support Web Audio.');
			}
			audioContext = new AudioContextClass();
		}
		return audioContext;
	}

	function getCaptureStream(element: HTMLAudioElement): MediaStream {
		const capturable = element as HTMLAudioElement & {
			captureStream?: () => MediaStream;
			mozCaptureStream?: () => MediaStream;
		};
		const stream = capturable.captureStream?.() ?? capturable.mozCaptureStream?.();
		if (!stream) {
			throw new Error('This browser cannot capture audio from the player.');
		}
		return stream;
	}

	function getRecordingMimeType() {
		const candidates = [
			'video/mp4;codecs=h264,aac',
			'video/webm;codecs=vp9,opus',
			'video/webm;codecs=vp8,opus',
			'video/webm'
		];
		return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? '';
	}

	function extensionForMimeType(mimeType: string) {
		return mimeType.includes('mp4') ? 'mp4' : 'webm';
	}

	function cleanOutputName(extension: string) {
		const trimmed = outputName.trim() || `milkdrop-social.${extension}`;
		return trimmed.replace(/\.(mp4|webm)$/i, `.${extension}`);
	}

	async function loadPresetNames() {
		try {
			const presets = await getPresetCollection();
			presetNames = Object.keys(presets).sort((a, b) => a.localeCompare(b));
		} catch (error) {
			console.error(error);
		}
	}

	async function getPresetCollection() {
		if (presetsCache) return presetsCache;
		const { default: presetsModule } = (await import('butterchurn-presets')) as {
			default: ButterchurnPresetsModule;
		};
		const butterchurnPresets =
			presetsModule?.getPresets != null ? presetsModule : presetsModule.default;
		if (!butterchurnPresets?.getPresets) {
			throw new Error('Unable to load Butterchurn presets.');
		}
		presetsCache = butterchurnPresets.getPresets();
		return presetsCache;
	}

	function selectPreset(presets: Record<string, unknown>) {
		const names = Object.keys(presets);
		const selectedName =
			preset.trim() === '' || preset.trim().toLowerCase() === 'random'
				? names[Math.floor(Math.random() * names.length)]
				: preset.trim();
		const selectedPreset = presets[selectedName];
		if (!selectedPreset) {
			throw new Error(`Preset not found: ${preset}`);
		}
		return selectedPreset;
	}

	async function ensureVisualizer() {
		status = 'loading';
		message = 'Loading visualizer...';

		const [{ default: butterchurnModule }, presets] = await Promise.all([
			import('butterchurn') as Promise<{ default: ButterchurnModule }>,
			getPresetCollection()
		]);
		const butterchurn =
			butterchurnModule?.createVisualizer != null ? butterchurnModule : butterchurnModule.default;
		if (!butterchurn?.createVisualizer) {
			throw new Error('Unable to load Butterchurn.');
		}
		const context = getAudioContext();

		if (!sourceNode) {
			sourceNode = context.createMediaElementSource(audioEl);
		}

		if (!visualizer) {
			visualizer = butterchurn.createVisualizer(context, canvasEl, {
				width: selectedProfile.width,
				height: selectedProfile.height,
				pixelRatio: 1,
				textureRatio: 1
			}) as ButterchurnVisualizer;
			visualizer.connectAudio(sourceNode);
			sourceNode.connect(context.destination);
		}

		visualizer.setRendererSize(selectedProfile.width, selectedProfile.height);
		visualizer.loadPreset(selectPreset(presets), 0);
		status = 'ready';
		message = 'Ready to record.';
	}

	function renderFrame() {
		visualizer?.render();
		animationFrame = requestAnimationFrame(renderFrame);
	}

	function stopRenderLoop() {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = 0;
		}
	}

	function downloadBlob(blob: Blob, mimeType: string) {
		if (downloadUrl) URL.revokeObjectURL(downloadUrl);
		const extension = extensionForMimeType(mimeType);
		downloadName = cleanOutputName(extension);
		downloadUrl = URL.createObjectURL(blob);
	}

	function loadFile(file: File) {
		if (sourceObjectUrl) URL.revokeObjectURL(sourceObjectUrl);
		if (downloadUrl) URL.revokeObjectURL(downloadUrl);
		downloadUrl = '';
		sourceObjectUrl = URL.createObjectURL(file);
		audioEl.src = sourceObjectUrl;
		fileName = file.name;
		status = 'idle';
		message = 'File loaded. Record when ready.';
	}

	async function waitForAudioMetadata() {
		if (audioEl.readyState >= HTMLMediaElement.HAVE_METADATA) return;
		await new Promise<void>((resolve, reject) => {
			audioEl.onloadedmetadata = () => resolve();
			audioEl.onerror = () => reject(new Error('Unable to load that audio file.'));
			audioEl.load();
		});
	}

	async function recordVideo() {
		try {
			if (!fileName) return;
			await ensureVisualizer();

			const context = getAudioContext();
			await context.resume();
			await waitForAudioMetadata();
			audioEl.pause();
			const maxStart = Number.isFinite(audioEl.duration) ? Math.max(audioEl.duration - 0.25, 0) : 0;
			audioEl.currentTime = Math.min(start, maxStart);

			const mimeType = getRecordingMimeType();
			const canvasStream = canvasEl.captureStream(fps);
			const audioStream = getCaptureStream(audioEl);
			const stream = new MediaStream([
				...canvasStream.getVideoTracks(),
				...audioStream.getAudioTracks()
			]);
			const chunks: Blob[] = [];
			const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

			recorder.ondataavailable = (recorderEvent) => {
				if (recorderEvent.data.size > 0) chunks.push(recorderEvent.data);
			};

			const stopped = new Promise<void>((resolve) => {
				recorder.onstop = () => resolve();
			});

			status = 'recording';
			message = 'Recording...';
			recorder.start(1000);
			renderFrame();
			await audioEl.play();
			await new Promise((resolve) => setTimeout(resolve, duration * 1000));
			audioEl.pause();
			stopRenderLoop();
			recorder.stop();
			stream.getTracks().forEach((track) => track.stop());
			await stopped;

			const resolvedMimeType = mimeType || chunks[0]?.type || 'video/webm';
			downloadBlob(new Blob(chunks, { type: resolvedMimeType }), resolvedMimeType);
			status = 'complete';
			message = 'Recording complete.';
		} catch (error) {
			stopRenderLoop();
			status = 'error';
			message = error instanceof Error ? error.message : 'Unable to record video.';
		}
	}

	onDestroy(() => {
		stopRenderLoop();
		if (sourceObjectUrl) URL.revokeObjectURL(sourceObjectUrl);
		if (downloadUrl) URL.revokeObjectURL(downloadUrl);
		void audioContext?.close();
	});
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header!} />

	<section class="maker" aria-label="MilkDrop recorder">
		<div class="workspace">
			<div class="preview" style={canvasStyle}>
				<canvas
					bind:this={canvasEl}
					width={selectedProfile.width}
					height={selectedProfile.height}
					aria-label="MilkDrop preview"
				></canvas>
			</div>
			<audio bind:this={audioEl} controls></audio>
		</div>

		<form aria-label="Recording controls" onsubmit={(event) => event.preventDefault()}>
			<label>
				<span>Audio file</span>
				<input type="file" accept="audio/*,video/*" bind:files={selectedFiles} />
			</label>

			<div class="field-grid">
				<label>
					<span>Output file</span>
					<input type="text" bind:value={outputName} />
				</label>
				<label>
					<span>Preset</span>
					<select bind:value={preset}>
						<option value="random">Random</option>
						{#each presetNames as presetName}
							<option value={presetName}>{presetName}</option>
						{/each}
					</select>
				</label>
			</div>

			<div class="field-grid field-grid--thirds">
				<label>
					<span>Duration</span>
					<input type="number" min="5" max="180" step="1" bind:value={duration} />
				</label>
				<label>
					<span>Start</span>
					<input type="number" min="0" step="1" bind:value={start} />
				</label>
				<label>
					<span>FPS</span>
					<input type="number" min="15" max="60" step="1" bind:value={fps} />
				</label>
			</div>

			<fieldset>
				<legend>Frame</legend>
				<div class="profile-options">
					{#each profiles as profile}
						<label class="profile-option" class:active={profile.key === profileKey}>
							<input type="radio" bind:group={profileKey} value={profile.key} />
							<span>{profile.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>

			<div class="actions">
				<button type="button" onclick={recordVideo} disabled={!canRecord}>
					{status === 'recording' ? 'Recording' : 'Record video'}
				</button>
				{#if downloadUrl}
					<a class="download-button" href={downloadUrl} download={downloadName}>Download video</a>
				{/if}
				<span class:status-error={status === 'error'}>{message}</span>
			</div>
		</form>
	</section>
</ArticlePage>

<style>
	.maker {
		display: grid;
		grid-template-columns: minmax(320px, 0.82fr) minmax(0, 1fr);
		gap: var(--space-7);
		align-items: start;
		margin-bottom: var(--space-8);
	}

	.workspace,
	form {
		border-top: 2px solid var(--color-text);
		padding-top: var(--space-4);
	}

	.workspace {
		display: grid;
		gap: 0;
	}

	.preview {
		overflow: hidden;
		width: 100%;
		max-height: min(70vh, 720px);
		border: 1px solid var(--color-line);
		background: #050505;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	audio {
		display: block;
		width: 100%;
		height: 44px;
	}

	form {
		display: grid;
		gap: var(--space-4);
	}

	label,
	fieldset {
		display: grid;
		gap: var(--space-2);
	}

	label span,
	legend {
		color: var(--color-muted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
	}

	input,
	select {
		width: 100%;
		border: 1px solid var(--color-line);
		border-radius: 4px;
		background: var(--color-background);
		color: var(--color-text);
		font: inherit;
		padding: var(--space-3);
	}

	input[type='file'],
	select {
		cursor: pointer;
	}

	input:focus,
	select:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: -1px;
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4);
	}

	.field-grid--thirds {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
	}

	.profile-options {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-2);
	}

	.profile-option {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 44px;
		border: 1px solid var(--color-line);
		border-radius: 4px;
		padding: var(--space-2) var(--space-3);
		cursor: pointer;
	}

	.profile-option.active {
		border-color: var(--color-text);
	}

	.profile-option input {
		width: auto;
		margin: 0;
		accent-color: var(--color-accent);
	}

	.profile-option span {
		color: var(--color-text);
		font-size: var(--font-size-sm);
		text-transform: none;
	}

	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	button,
	.download-button {
		border: 1px solid var(--color-text);
		border-radius: 4px;
		background: var(--color-text);
		color: var(--color-background);
		font: inherit;
		font-weight: var(--font-weight-bold);
		padding: var(--space-2) var(--space-4);
		text-decoration: none;
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.actions span {
		color: var(--color-muted);
		font-size: var(--font-size-sm);
	}

	.actions .status-error {
		color: var(--color-accent);
	}

	@media (max-width: 900px) {
		.workspace {
			order: 2;
		}

		form {
			order: 1;
		}

		.maker,
		.field-grid,
		.field-grid--thirds,
		.profile-options {
			grid-template-columns: 1fr;
		}
	}
</style>
