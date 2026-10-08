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
			desc="A line traces relative humidity readings over time. The shaded band marks the target range."
			axisTitle="RH%"
		>
			{#snippet legend()}
				<span><i class="band"></i> Target range ({chart.targetMin}–{chart.targetMax}%)</span>
			{/snippet}

			{#snippet background()}
				<path class="target-band" d={chart.targetBandPath} />
			{/snippet}

			<path class="reading-line" d={chart.linePath} />
		</ChartFrame>
	{/if}
</div>

<style>
	.chart-container {
		min-height: 360px;
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

	.reading-line {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
