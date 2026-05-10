<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildHumidityChart } from './humidityChart';
	import type { HumidityReading } from './humidor';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = {
		readings: HumidityReading[];
	};

	let { readings }: Props = $props();

	const container = createContainerWidth();
	const chart = $derived(
		container.width > 0 ? buildHumidityChart(readings, container.width) : null
	);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			chartId="humidity-chart"
			heading="Humidity trend"
			title="Relative humidity readings over time"
			desc="Each reading is plotted as a dot showing RH%. The shaded band marks the target range. The line shows the 5-reading rolling average."
			axisTitle="RH%"
		>
			{#snippet legend()}
				<span><i class="band"></i> Target range ({chart.targetMin}–{chart.targetMax}%)</span>
				<span><i class="dot"></i> Reading</span>
			{/snippet}

			{#snippet background()}
				<path class="target-band" d={chart.targetBandPath} />
			{/snippet}

			<path class="reading-line" d={chart.linePath} />
			{#each chart.points as point}
				<circle class="test-dot" cx={point.x} cy={point.y} r="5">
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

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: var(--color-accent);
		opacity: 1;
	}

	.band {
		width: 24px;
		height: 10px;
		background: var(--color-accent);
		opacity: 0.12;
		border-radius: 2px;
	}

	.target-band {
		fill: var(--color-accent);
		fill-opacity: 0.1;
	}

	.test-dot {
		fill: var(--color-accent);
		fill-opacity: 1;
		stroke: var(--color-background);
		stroke-width: 1;
	}

	.reading-line {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 3;
		stroke-opacity: 0.4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
