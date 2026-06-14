<script lang="ts">
	import { onDestroy } from 'svelte';

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

	let playing = $state(false);
	let loading = $state(false);
	let started = $state(false);
	let message = $state('');

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
		visualizer?.render();
		animationFrame = requestAnimationFrame(renderFrame);
	}

	function stopRenderLoop() {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = 0;
		}
	}

	async function play() {
		try {
			loading = true;
			message = '';
			await ensureVisualizer();
			await getAudioContext().resume();
			await audioEl.play();
			renderFrame();
			playing = true;
			started = true;
		} catch (error) {
			message = error instanceof Error ? error.message : 'Unable to start the visualizer.';
		} finally {
			loading = false;
		}
	}

	function pause() {
		audioEl.pause();
		stopRenderLoop();
		playing = false;
	}

	function toggle() {
		if (playing) pause();
		else void play();
	}

	function handleEnded() {
		stopRenderLoop();
		playing = false;
	}

	onDestroy(() => {
		stopRenderLoop();
		void audioContext?.close();
	});
</script>

<figure class="milkdrop">
	<div class="stage" style={`aspect-ratio: ${width} / ${height};`}>
		<canvas bind:this={canvasEl} {width} {height} aria-label="Live MilkDrop visualization"></canvas>
		<button
			type="button"
			class="overlay"
			class:hidden={playing}
			onclick={toggle}
			aria-label={playing ? 'Pause visualization' : 'Play visualization'}
		>
			<span class="badge">
				{#if loading}
					Loading…
				{:else if playing}
					❚❚
				{:else}
					▶
				{/if}
				<span class="label">
					{loading ? 'Starting' : started ? (playing ? 'Pause' : 'Resume') : 'Play 5-second clip'}
				</span>
			</span>
		</button>
	</div>
	<audio bind:this={audioEl} {src} loop preload="none" crossorigin="anonymous"></audio>
	<figcaption>
		{caption}
		{#if message}<span class="error"> — {message}</span>{/if}
	</figcaption>
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

	.overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		margin: 0;
		padding: 0;
		cursor: pointer;
		background: radial-gradient(circle at center, rgba(5, 6, 10, 0.15), rgba(5, 6, 10, 0.55));
		transition: opacity 0.2s ease;
		color: #fff;
	}

	.overlay.hidden {
		opacity: 0;
		pointer-events: none;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-5);
		border-radius: 999px;
		background: rgba(5, 6, 10, 0.6);
		backdrop-filter: blur(4px);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
	}

	.label {
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	figcaption {
		margin-top: var(--space-2);
		color: var(--color-muted);
		font-size: var(--font-size-xs);
	}

	.error {
		color: var(--color-accent-secondary);
	}
</style>
