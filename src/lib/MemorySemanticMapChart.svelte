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

		<div class="cluster-summary" aria-label="Semantic cluster summary">
			<div class="table-heading">
				<h3 id={`${chartId}-cluster-summary-heading`}>Topics</h3>
				<p class="count-text">{chart.clusters.length} clusters</p>
			</div>
			<div class="table-frame">
				<table>
					<thead>
						<tr>
							<th>Cluster</th>
							<th>Summary</th>
							<th>Points</th>
							<th>Share</th>
						</tr>
					</thead>
					<tbody>
						{#each chart.clusters as cluster}
							<tr>
								<td>
									<span class="cluster-pill">
										<i class="swatch" style={`background:${cluster.color}`}></i>
										{cluster.label}
									</span>
								</td>
								<td>{cluster.description}</td>
								<td>{cluster.size}</td>
								<td>{cluster.sharePct.toFixed(1)}%</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
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

	.cluster-summary {
		margin-top: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.table-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-3);
	}

	h3 {
		margin: 0;
		font-size: var(--font-size-xl);
		line-height: var(--line-height-snug);
	}

	.count-text {
		margin: 0;
		color: var(--color-muted);
		font-size: var(--font-size-xs);
	}

	.table-frame {
		overflow-x: auto;
		border-top: 2px solid var(--color-text);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--font-size-xs);
	}

	th,
	td {
		padding: 0.4rem 0.45rem;
		border-top: 1px solid var(--color-line);
		text-align: left;
		vertical-align: top;
	}

	thead th {
		color: var(--color-muted);
		font-weight: 600;
		text-transform: uppercase;
	}

	.cluster-pill {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	@media (max-width: 760px) {
		.table-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-1);
		}
	}
</style>
