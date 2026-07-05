<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildMemoryTrendChart } from './memoryChart';
	import type { OpenClawMemorySnapshot } from './openclawMemory';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = {
		rows: OpenClawMemorySnapshot[];
		title: string;
		chartId: string;
	};

	let { rows, title, chartId }: Props = $props();

	const container = createContainerWidth();
	const chart = $derived(container.width > 0 ? buildMemoryTrendChart(rows, container.width) : null);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			{chartId}
			heading={title}
			title={`${title} for indexed chunks and recall entries over time`}
			desc="Two time-series lines compare indexed chunks and recall entries to show how memory index growth and recall volume are trending."
			axisTitle="Count"
		>
			{#snippet legend()}
				<span><i class="line chunks"></i> Indexed chunks</span>
				<span><i class="line recall"></i> Recall entries</span>
			{/snippet}

			<path class="chunks-line" d={chart.chunksPath} />
			<path class="recall-line" d={chart.recallPath} />

			{#each chart.chunkPoints as point}
				<circle class="chunks-dot" cx={point.x} cy={point.y} r="2.75">
					<title>{point.title}</title>
				</circle>
			{/each}
			{#each chart.recallPoints as point}
				<circle class="recall-dot" cx={point.x} cy={point.y} r="2.75">
					<title>{point.title}</title>
				</circle>
			{/each}
		</ChartFrame>
	{/if}
</div>

<style>
	.chart-container {
		min-height: 360px;
	}

	.line {
		width: 24px;
		height: 2px;
	}

	.line.chunks {
		background: var(--color-accent);
	}

	.line.recall {
		background: var(--color-text);
	}

	.chunks-line {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.recall-line {
		fill: none;
		stroke: var(--color-text);
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.chunks-dot {
		fill: var(--color-accent);
		fill-opacity: 0.4;
		stroke: var(--color-background);
		stroke-width: 1;
	}

	.recall-dot {
		fill: var(--color-text);
		fill-opacity: 0.35;
		stroke: var(--color-background);
		stroke-width: 1;
	}
</style>
