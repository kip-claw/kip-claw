<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildSpeedChart } from './speedChart';
	import type { SpeedTest } from './speedTests';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = {
		tests: SpeedTest[];
		metric: 'download' | 'upload';
		title: string;
		chartId: string;
	};

	let { tests, metric, title, chartId }: Props = $props();

	const container = createContainerWidth();
	const chart = $derived(
		container.width > 0 ? buildSpeedChart(tests, container.width, metric) : null
	);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			{chartId}
			heading={title}
			title={`${title} results and 7-day rolling average`}
			desc="Every speed test is plotted as a dot in megabits per second. The line shows the 7-day rolling average."
			axisTitle="Mbps"
		>
			{#snippet legend()}
				<span><i class="dot"></i> Test</span>
				<span><i class="line"></i> 7-day average</span>
			{/snippet}

			{#each chart.points as point}
				<circle class="test-dot" cx={point.x} cy={point.y} r="3.5">
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

	.test-dot {
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
