<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildArchiveBoxChart } from './archiveboxChart';
	import type { ArchiveBoxDay } from './archiveboxStats';
	import { createContainerWidth } from './useContainerWidth.svelte';
	let { rows, title, chartId }: { rows: ArchiveBoxDay[]; title: string; chartId: string } =
		$props();
	const container = createContainerWidth();
	const chart = $derived(container.width > 0 ? buildArchiveBoxChart(rows, container.width) : null);
</script>

<div use:container.action class="chart-container">
	{#if chart}<ChartFrame
			{chart}
			{chartId}
			heading={title}
			title={`${title} over time`}
			desc="Cumulative total of archived URLs in ArchiveBox."
			axisTitle="Archived items"
		>
			{#snippet legend()}{/snippet}
			<path class="line" d={chart.path} />
		</ChartFrame>{/if}
</div>

<style>
	.chart-container {
		min-height: 360px;
	}
	.line {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
