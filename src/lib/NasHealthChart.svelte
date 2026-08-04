<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildNasHealthChart } from './nasHealthChart';
	import type { NasHealthSnapshot } from './nasHealth';
	import { createContainerWidth } from './useContainerWidth.svelte';

	let { rows, title, chartId }: { rows: NasHealthSnapshot[]; title: string; chartId: string } =
		$props();
	const container = createContainerWidth();
	const chart = $derived(container.width > 0 ? buildNasHealthChart(rows, container.width) : null);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			{chartId}
			heading={title}
			title={`${title} over time`}
			desc="The NAS volume shown as stacked used and free space percentages over time."
			axisTitle="Percent of volume"
		>
			{#snippet legend()}
				<span><i class="swatch used"></i> Used</span>
				<span><i class="swatch free"></i> Free</span>
			{/snippet}
			<path class="free-area" d={chart.freePath} />
			<path class="used-area" d={chart.usedPath} />
		</ChartFrame>
	{/if}
</div>

<style>
	.chart-container {
		min-height: 360px;
	}

	.swatch {
		display: inline-block;
		width: 14px;
		height: 10px;
	}

	.swatch.used,
	.used-area {
		background: var(--color-accent);
		fill: var(--color-accent);
		fill-opacity: 0.82;
	}

	.swatch.free,
	.free-area {
		background: var(--color-line);
		fill: var(--color-line);
		fill-opacity: 0.7;
	}
</style>
