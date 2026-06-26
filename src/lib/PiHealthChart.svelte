<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildPiTempChart } from './piHealthChart';
	import type { PiHealthSnapshot } from './piHealth';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = {
		rows: PiHealthSnapshot[];
		title: string;
		chartId: string;
	};

	let { rows, title, chartId }: Props = $props();

	const container = createContainerWidth();
	const chart = $derived(container.width > 0 ? buildPiTempChart(rows, container.width) : null);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			{chartId}
			heading={title}
			title={`${title} over time, with the 80°C throttle threshold`}
			desc="CPU and GPU temperature in degrees Celsius over time. The dashed line marks 80°C, where the Raspberry Pi begins throttling its clocks."
			axisTitle="°C"
		>
			{#snippet legend()}
				<span><i class="line cpu"></i> CPU</span>
				<span><i class="line gpu"></i> GPU</span>
				<span><i class="line threshold"></i> 80°C throttle</span>
			{/snippet}

			{#snippet background()}
				<line
					class="threshold-line"
					x1={chart.margin.left}
					x2={chart.width - chart.margin.right}
					y1={chart.threshold.y}
					y2={chart.threshold.y}
				/>
			{/snippet}

			<path class="gpu-line" d={chart.gpuPath} />
			<path class="cpu-line" d={chart.cpuPath} />
			{#each chart.points as point}
				<circle class="cpu-dot" cx={point.x} cy={point.y} r="2.5">
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
		display: inline-block;
		width: 14px;
		height: 0;
		border-top-width: 2px;
		border-top-style: solid;
	}

	.line.cpu {
		border-top-color: var(--color-accent);
	}

	.line.gpu {
		border-top-color: #2b6cb0;
	}

	.line.threshold {
		border-top-style: dashed;
		border-top-color: #d97706;
	}

	.cpu-line {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 1.75;
	}

	.gpu-line {
		fill: none;
		stroke: #2b6cb0;
		stroke-width: 1.75;
	}

	.cpu-dot {
		fill: var(--color-accent);
		opacity: 0.55;
	}

	.threshold-line {
		stroke: #d97706;
		stroke-width: 1.3;
		stroke-dasharray: 5 4;
	}
</style>
