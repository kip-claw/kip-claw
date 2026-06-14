<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	type Props = {
		src: string;
		caption: string;
		preset?: string;
		width?: number;
		height?: number;
	};

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

	let { src, caption, preset = 'random', width = 1280, height = 720 }: Props = $props();

	let canvasEl: HTMLCanvasElement;
	let audioEl: HTMLAudioElement;
	let audioContext: AudioContext | undefined;
	let sourceNode: MediaElementAudioSourceNode | undefined;
	let visualizer: ButterchurnVisualizer | undefined;
	let animationFrame = 0;

	function getAudioContext() {
		if (!audioContext) {
			const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
			const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
			if (!AudioContextClass) throw new Error('This browser does not support Web Audio.');
			audioContext = new AudioContextClass();
		}
		return audioContext;
	}

	async function getPresetCollection() {
		const { default: presetsModule } = (await import('butterchurn-presets')) as {
			default: ButterchurnPresetsModule;
		};
		const presets = presetsModule?.getPresets != null ? presetsModule : presetsModule.default;
		if (!presets?.getPresets) throw new Error('Unable to load Butterchurn presets.');
		return presets.getPresets();
	}

	function selectPreset(presets: Record<string, unknown>) {
		const names = Object.keys(presets);
		const name =
			preset.trim() === '' || preset.trim().toLowerCase() === 'random'
				? names[Math.floor(Math.random() * names.length)]
				: preset.trim();
		return presets[name] ?? presets[names[0]];
	}

	async function ensureVisualizer() {
		if (visualizer) return;
		const [{ default: butterchurnModule }, presets] = await Promise.all([
			import('butterchurn') as Promise<{ default: ButterchurnModule }>,
			getPresetCollection()
		]);
		const butterchurn =
			butterchurnModule?.createVisualizer != null ? butterchurnModule : butterchurnModule.default;
		if (!butterchurn?.createVisualizer) throw new Error('Unable to load Butterchurn.');

		const context = getAudioContext();
		if (!sourceNode) sourceNode = context.createMediaElementSource(audioEl);

		visualizer = butterchurn.createVisualizer(context, canvasEl, {
			width,
			height,
			pixelRatio: 1,
			textureRatio: 1
		});
		visualizer.connectAudio(sourceNode);
		sourceNode.connect(context.destination);
		visualizer.setRendererSize(width, height);
		visualizer.loadPreset(selectPreset(presets), 0);
	}

	function renderFrame() {
		try {
			visualizer?.render();
		} catch (error) {
			console.error('MilkDrop render error', error);
		}
		animationFrame = requestAnimationFrame(renderFrame);
	}

	function stopRenderLoop() {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = 0;
		}
	}

	let removeGestureListeners: (() => void) | undefined;

	// Strict browsers leave an AudioContext suspended until the visitor interacts,
	// and they may block even muted autoplay. Resume + play on the first user
	// gesture so the audio (and audio reactivity) come up; the visuals themselves
	// animate without it.
	function armGestureResume() {
		const events = ['pointerdown', 'keydown', 'touchstart'];
		const handler = () => {
			audioContext?.resume().catch(() => {});
			audioEl?.play().catch(() => {});
		};
		for (const event of events) {
			document.addEventListener(event, handler, { passive: true });
		}
		removeGestureListeners = () => {
			for (const event of events) document.removeEventListener(event, handler);
			removeGestureListeners = undefined;
		};
	}

	async function start() {
		try {
			await ensureVisualizer();
		} catch (error) {
			console.error('MilkDrop visualizer failed to start', error);
			return;
		}

		// butterchurn animates off performance.now(), so start the loop immediately
		// and never block it on audio. Otherwise a strict autoplay policy (where
		// resume()/play() stays pending until a gesture) would leave a black box.
		renderFrame();

		// Best-effort, non-blocking: muted playback is allowed in most browsers and
		// keeps the loop in sync with the clip; failures are fine because the
		// gesture listener below recovers and the visuals run regardless.
		audioEl.muted = true;
		audioContext?.resume().catch(() => {});
		audioEl.play().catch(() => {});
		armGestureResume();
	}

	onMount(() => {
		void start();
	});

	onDestroy(() => {
		stopRenderLoop();
		removeGestureListeners?.();
		void audioContext?.close();
	});
</script>

<figure class="milkdrop">
	<div class="stage" style={`aspect-ratio: ${width} / ${height};`}>
		<canvas bind:this={canvasEl} {width} {height} aria-label="Live MilkDrop visualization"></canvas>
	</div>
	<audio bind:this={audioEl} {src} loop muted preload="auto" crossorigin="anonymous"></audio>
	<figcaption>{caption}</figcaption>
</figure>

<style>
	.milkdrop {
		margin: var(--space-6) 0;
	}

	.stage {
		position: relative;
		width: 100%;
		border-radius: var(--radius-card);
		overflow: hidden;
		box-shadow: var(--shadow-panel);
		background: #05060a;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	figcaption {
		margin-top: var(--space-2);
		color: var(--color-muted);
		font-size: var(--font-size-xs);
	}
</style>
