<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildMemorySemanticMapChart } from './memorySemanticMapChart';
	import type { OpenClawMemoryMapSnapshot } from './openclawMemoryMap';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = {
		snapshot: OpenClawMemoryMapSnapshot;
		title: string;
		chartId: string;
	};

	let { snapshot, title, chartId }: Props = $props();

	const container = createContainerWidth();
	const chart = $derived(
		container.width > 0 ? buildMemorySemanticMapChart(snapshot, container.width) : null
	);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			{chartId}
			heading={title}
			title={`${title} projected to 2D semantic space`}
			desc="Each dot is a memory chunk embedding projected into 2D and colored by cluster. Nearby points are semantically similar in local neighborhoods."
			axisTitle="Projected dimensions"
		>
			{#snippet legend()}
				{#each chart.clusters.slice(0, 5) as cluster}
					<span>
						<i class="swatch" style={`background:${cluster.color}`}></i>
						{cluster.label} ({cluster.size})
					</span>
				{/each}
			{/snippet}

			{#snippet background()}
				<line
					class="cross-axis"
					x1={chart.xZero}
					x2={chart.xZero}
					y1={chart.margin.top}
					y2={chart.height - chart.margin.bottom}
				/>
				<line
					class="cross-axis"
					x1={chart.margin.left}
					x2={chart.width - chart.margin.right}
					y1={chart.yZero}
					y2={chart.yZero}
				/>
			{/snippet}

			{#each chart.points as point}
				<circle class="map-point" cx={point.x} cy={point.y} r="3" style={`fill:${point.color}`}>
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

	.swatch {
		width: 10px;
		height: 10px;
		border-radius: 999px;
		display: inline-block;
	}

	.cross-axis {
		stroke: var(--color-line);
		stroke-width: 1;
		stroke-dasharray: 3 3;
	}

	.map-point {
		opacity: 0.7;
		stroke: var(--color-background);
		stroke-width: 0.6;
	}
</style>
