<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildMemoryCoverageChart } from './memoryChart';
	import type { OpenClawMemorySnapshot } from './openclawMemory';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = {
		rows: OpenClawMemorySnapshot[];
		title: string;
		chartId: string;
	};

	let { rows, title, chartId }: Props = $props();

	const container = createContainerWidth();
	const chart = $derived(
		container.width > 0 ? buildMemoryCoverageChart(rows, container.width) : null
	);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			{chartId}
			heading={title}
			title={`${title} snapshots and 7-snapshot rolling average`}
			desc="Each point is a memory index coverage snapshot percentage. The line shows the 7-snapshot rolling average trend."
			axisTitle="Coverage %"
		>
			{#snippet legend()}
				<span><i class="dot"></i> Snapshot</span>
				<span><i class="line"></i> 7-snapshot average</span>
			{/snippet}

			{#each chart.points as point}
				<circle class="snapshot-dot" cx={point.x} cy={point.y} r="3.5">
					<title>{point.title}</title>
				</circle>
			{/each}
			<path class="average-line" d={chart.averagePath} />
		</ChartFrame>
	{/if}
</div>

<style>
	.chart-container {
		min-height: 360px;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: var(--color-accent);
		opacity: 0.6;
	}

	.line {
		width: 24px;
		height: 2px;
		background: var(--color-text);
	}

	.snapshot-dot {
		fill: var(--color-accent);
		fill-opacity: 0.45;
		stroke: var(--color-background);
		stroke-width: 1;
	}

	.average-line {
		fill: none;
		stroke: var(--color-text);
		stroke-width: 4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
