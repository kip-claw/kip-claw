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
			desc="Total LLM tokens consumed per day across all of Kip's agent turns, including prompt input, generated output, and cached context reads."
			axisTitle="Tokens per day"
		>
			{#snippet legend()}
				<span><i class="swatch"></i> Total tokens</span>
			{/snippet}
			{#each chart.bars as bar}
				<rect class="bar" x={bar.x} y={bar.y} width={bar.width} height={bar.height}>
					<title>{bar.title}</title>
				</rect>
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
		background: var(--color-accent);
		border-radius: 2px;
	}
	.bar {
		fill: var(--color-accent);
		opacity: 0.8;
	}
	.bar:hover {
		opacity: 1;
	}
</style>
