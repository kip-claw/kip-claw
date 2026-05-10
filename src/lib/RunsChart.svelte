<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildRunsChart } from './runsChart';
	import type { Run } from './runs';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = {
		runs: Run[];
	};

	let { runs }: Props = $props();

	const container = createContainerWidth();
	const chart = $derived(container.width > 0 ? buildRunsChart(runs, container.width) : null);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			chartId="runs-chart"
			heading="Distance"
			title="Run distances and 7-day rolling average"
			desc="Each run is plotted as a bar showing distance in miles. The line shows the 7-day rolling average."
			axisTitle="Miles"
		>
			{#snippet legend()}
				<span><i class="bar"></i> Run</span>
				<span><i class="line"></i> 7-day average</span>
			{/snippet}

			{#each chart.bars as bar}
				<rect class="run-bar" x={bar.x} y={bar.y} width={bar.width} height={bar.height}>
					<title>{bar.title}</title>
				</rect>
			{/each}
			<path class="average-line" d={chart.averagePath} />
		</ChartFrame>
	{/if}
</div>

<style>
	.chart-container {
		min-height: 360px;
	}

	.bar {
		width: 10px;
		height: 14px;
		background: var(--color-accent);
		opacity: 0.6;
		border-radius: 1px;
	}

	.line {
		width: 24px;
		height: 2px;
		background: var(--color-text);
	}

	.run-bar {
		fill: var(--color-accent);
		fill-opacity: 0.55;
	}

	.average-line {
		fill: none;
		stroke: var(--color-text);
		stroke-width: 4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
