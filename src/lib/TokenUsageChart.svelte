<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildTokenUsageChart } from './tokenUsageChart';
	import type { TokenUsageDay } from './tokenUsage';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = { rows: TokenUsageDay[]; title: string; chartId: string };
	let { rows, title, chartId }: Props = $props();
	const container = createContainerWidth();
	const chart = $derived(container.width > 0 ? buildTokenUsageChart(rows, container.width) : null);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			{chartId}
			heading={title}
			title={`${title} over time`}
			desc="Daily LLM tokens consumed across all of Kip's agent turns, stacked as prompt input plus generated output."
			axisTitle="Tokens per day"
		>
			{#snippet legend()}
				<span><i class="swatch input"></i> Input</span>
				<span><i class="swatch output"></i> Output</span>
			{/snippet}
			{#each chart.bars as bar}
				{#each bar.segments as segment}
					<rect
						class="bar {segment.series}"
						x={bar.x}
						y={segment.y}
						width={bar.width}
						height={segment.height}
					>
						<title>{bar.title}</title>
					</rect>
				{/each}
			{/each}
		</ChartFrame>
	{/if}
</div>

<style>
	.chart-container {
		min-height: 360px;
	}
	.swatch {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 2px;
	}
	.swatch.input,
	.bar.input {
		fill: var(--color-accent);
		background: var(--color-accent);
	}
	.swatch.output,
	.bar.output {
		fill: #2b6cb0;
		background: #2b6cb0;
	}
	.bar {
		opacity: 0.85;
	}
	.bar:hover {
		opacity: 1;
	}
</style>
