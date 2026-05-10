<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ChartFrameModel } from './chartShared';

	type Props = {
		chart: ChartFrameModel;
		chartId: string;
		heading: string;
		title: string;
		desc: string;
		axisTitle: string;
		legend: Snippet;
		background?: Snippet;
		children: Snippet;
	};

	let { chart, chartId, heading, title, desc, axisTitle, legend, background, children }: Props =
		$props();
</script>

<section class="chart-section" aria-labelledby={`${chartId}-heading`}>
	<div class="chart-heading">
		<div>
			<h3 id={`${chartId}-heading`}>{heading}</h3>
		</div>
		<div class="legend" aria-label="Chart legend">
			{@render legend()}
		</div>
	</div>

	<div class="chart-frame">
		<svg
			viewBox={`0 0 ${chart.width} ${chart.height}`}
			role="img"
			aria-labelledby={`${chartId}-title ${chartId}-desc`}
		>
			<title id={`${chartId}-title`}>{title}</title>
			<desc id={`${chartId}-desc`}>{desc}</desc>
			{@render background?.()}
			{#each chart.yTicks as tick}
				<line
					class="grid-line"
					x1={chart.margin.left}
					x2={chart.width - chart.margin.right}
					y1={tick.y}
					y2={tick.y}
				/>
				<text class="axis-label y-label" x={chart.margin.left - 12} y={(tick.y ?? 0) + 4}>
					{tick.label}
				</text>
			{/each}
			<text class="axis-title" x={chart.margin.left} y={chart.margin.top - 10}>{axisTitle}</text>
			<line
				class="axis-line"
				x1={chart.margin.left}
				x2={chart.width - chart.margin.right}
				y1={chart.height - chart.margin.bottom}
				y2={chart.height - chart.margin.bottom}
			/>
			{#each chart.xTicks as tick}
				<text class="axis-label x-label" x={tick.x} y={chart.height - chart.margin.bottom + 28}>
					{tick.label}
				</text>
			{/each}
			{@render children()}
		</svg>
	</div>
</section>

<style>
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

	.legend :global(span) {
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

	.grid-line {
		stroke: var(--color-line);
		stroke-width: 1;
	}

	.axis-line {
		stroke: var(--color-text);
		stroke-width: 1.3;
	}

	.axis-label,
	.axis-title {
		fill: var(--color-muted);
		font-size: 11px;
	}

	.y-label {
		text-anchor: end;
	}

	.x-label {
		text-anchor: middle;
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
	}
</style>
