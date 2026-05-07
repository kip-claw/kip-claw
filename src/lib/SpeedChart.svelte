<script lang="ts">
	import type { SpeedChartModel } from './speedChart';

	type Props = {
		chart: SpeedChartModel;
		title: string;
		chartId: string;
	};

	let { chart, title, chartId }: Props = $props();
</script>

<section class="chart-section" aria-labelledby={`${chartId}-heading`}>
	<div class="chart-heading">
		<div>
			<h3 id={`${chartId}-heading`}>{title}</h3>
		</div>
		<div class="legend" aria-label="Chart legend">
			<span><i class="dot"></i> Test</span>
			<span><i class="line"></i> 7-day average</span>
		</div>
	</div>

	<div class="chart-frame">
		<svg
			viewBox={`0 0 ${chart.width} ${chart.height}`}
			role="img"
			aria-labelledby={`${chartId}-title ${chartId}-desc`}
		>
			<title id={`${chartId}-title`}>{title} results and 7-day rolling average</title>
			<desc id={`${chartId}-desc`}>
				Every speed test is plotted as a dot in megabits per second. The line shows the 7-day
				rolling average.
			</desc>
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
			<text class="axis-title" x={chart.margin.left} y={chart.margin.top - 10}>Mbps</text>
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
			{#each chart.points as point}
				<circle class="test-dot" cx={point.x} cy={point.y} r="3.5">
					<title>{point.title}</title>
				</circle>
			{/each}
			<path class="average-line" d={chart.averagePath} />
		</svg>
	</div>
</section>

<style>
	.chart-section {
		min-width: 0;
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

	.legend span {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
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
		font-size: 13px;
	}

	.y-label {
		text-anchor: end;
	}

	.x-label {
		text-anchor: middle;
	}

	.test-dot {
		fill: var(--color-accent);
		fill-opacity: 0.45;
		stroke: var(--color-background);
		stroke-width: 1;
	}

	.average-line {
		fill: none;
		stroke: var(--color-text);
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
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
