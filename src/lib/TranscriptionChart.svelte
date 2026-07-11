<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildTranscriptionChart } from './transcriptionChart';
	import type { TranscriptionRequest } from './transcriptionDiagnostics';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = { rows: TranscriptionRequest[]; title: string; chartId: string };
	let { rows, title, chartId }: Props = $props();
	const container = createContainerWidth();
	const chart = $derived(
		container.width > 0 ? buildTranscriptionChart(rows, container.width) : null
	);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			{chartId}
			heading={title}
			title={`${title} over time`}
			desc="Daily median and p95 real-time factor for successful voice transcriptions. A value of 0.10× means one minute of audio took six seconds to transcribe."
			axisTitle="Real-time factor"
		>
			{#snippet legend()}
				<span><i class="line median"></i> Daily median</span>
				<span><i class="line p95"></i> Daily p95</span>
			{/snippet}
			<path class="p95-line" d={chart.p95Path} />
			<path class="median-line" d={chart.medianPath} />
			{#each chart.points as point}
				<circle cx={point.x} cy={point.y} r="2.5"><title>{point.title}</title></circle>
			{/each}
		</ChartFrame>
	{/if}
</div>

<style>
	.chart-container {
		min-height: 360px;
	}
	.line {
		display: inline-block;
		width: 14px;
		height: 0;
		border-top: 2px solid;
	}
	.line.median,
	.median-line {
		border-color: var(--color-accent);
		stroke: var(--color-accent);
	}
	.line.p95,
	.p95-line {
		border-color: #2b6cb0;
		stroke: #2b6cb0;
	}
	.median-line,
	.p95-line {
		fill: none;
		stroke-width: 1.75;
	}
	circle {
		fill: var(--color-accent);
		opacity: 0.55;
	}
</style>
