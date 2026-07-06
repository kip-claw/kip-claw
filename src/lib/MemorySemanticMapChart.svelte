<script lang="ts">
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
		<section class="chart-section" aria-labelledby={`${chartId}-heading`}>
			<div class="chart-heading">
				<div>
					<h3 id={`${chartId}-heading`}>{title}</h3>
				</div>
				<div class="legend" aria-label="Chart legend">
					{#each chart.clusters.slice(0, 5) as cluster}
						<span>
							<i class="swatch" style={`background:${cluster.color}`}></i>
							{cluster.displayLabel} ({cluster.size})
						</span>
					{/each}
				</div>
			</div>

			<div class="chart-frame">
				<svg
					viewBox={`0 0 ${chart.width} ${chart.height}`}
					role="img"
					aria-labelledby={`${chartId}-title ${chartId}-desc`}
				>
					<title id={`${chartId}-title`}>{title} shown as a hierarchical treemap</title>
					<desc id={`${chartId}-desc`}
						>Topic clusters are shown as large blocks, with subtopic keywords nested inside each
						block.</desc
					>

					{#each chart.familyRects as family}
						<rect
							class="family-rect"
							x={family.x}
							y={family.y}
							width={family.width}
							height={family.height}
						/>
						{#if family.width > 112 && family.height > 22}
							<text class="family-label" x={family.x + 6} y={family.y + 13}>{family.label}</text>
						{/if}
					{/each}

					{#each chart.clusterRects as cluster}
						<rect
							class="cluster-rect"
							x={cluster.x}
							y={cluster.y}
							width={cluster.width}
							height={cluster.height}
							style={`fill:${cluster.color}`}
						/>
						{#if cluster.width > 90 && cluster.height > 30}
							<text class="cluster-label" x={cluster.x + 6} y={cluster.y + 12}>{cluster.label}</text
							>
						{/if}
					{/each}

					{#each chart.keywordRects as node}
						<rect
							class="keyword-rect"
							x={node.x}
							y={node.y}
							width={node.width}
							height={node.height}
							style={`fill:${node.color}`}
						>
							<title>{node.title}</title>
						</rect>
						{#if node.width > 64 && node.height > 18}
							<text class="keyword-label" x={node.x + 5} y={node.y + 13}>{node.keyword}</text>
						{/if}
					{/each}
				</svg>
			</div>
		</section>

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
							<th>Group</th>
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
										{cluster.displayLabel}
									</span>
								</td>
								<td>{cluster.groupLabel}</td>
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
		min-height: 0;
	}

	.chart-section {
		min-width: 0;
		margin-bottom: var(--space-6);
	}

	.chart-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-5);
		margin-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-line);
		padding-bottom: var(--space-3);
	}

	.swatch {
		width: 10px;
		height: 10px;
		border-radius: 999px;
		display: inline-block;
	}

	h3 {
		margin: 0;
		font-size: var(--font-size-xl);
		line-height: var(--line-height-snug);
	}

	.legend {
		display: flex;
		gap: var(--space-4);
		color: var(--color-muted);
		font-size: var(--font-size-xs);
		white-space: nowrap;
	}

	.legend span {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.chart-frame {
		border-bottom: 1px solid var(--color-line);
		padding-bottom: var(--space-2);
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.family-rect {
		fill: transparent;
		stroke: var(--color-line);
		stroke-width: 1;
	}

	.cluster-rect {
		fill-opacity: 0.18;
		stroke: rgba(0, 0, 0, 0.18);
		stroke-width: 1;
	}

	.keyword-rect {
		fill-opacity: 0.85;
		stroke: var(--color-background);
		stroke-width: 0.8;
	}

	.family-label,
	.cluster-label,
	.keyword-label {
		fill: var(--color-text);
		font-size: 11px;
		pointer-events: none;
	}

	.family-label {
		font-size: 10px;
		font-weight: 600;
		fill: var(--color-muted);
		text-transform: uppercase;
	}

	.keyword-label {
		fill: white;
		font-size: 10px;
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
		.chart-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-3);
		}

		.legend {
			flex-wrap: wrap;
			white-space: normal;
		}

		.table-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-1);
		}
	}
</style>
