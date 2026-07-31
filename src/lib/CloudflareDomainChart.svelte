<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildCloudflareDomainChart } from './cloudflareDomainChart';
	import type { DomainRunSummary } from './cloudflareDomains';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = {
		runs: DomainRunSummary[];
	};

	let { runs }: Props = $props();

	const container = createContainerWidth();
	const chart = $derived(
		container.width > 0 ? buildCloudflareDomainChart(runs, container.width) : null
	);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			chartId="domain-response-chart"
			heading="Response trend"
			title="HTTPS response time range across monitored domains"
			desc="The line is a 1-day rolling average of HTTPS response time. The shaded band shows the daily range across monitored domains, capped at 1,500 ms."
			axisTitle="Milliseconds"
		>
			{#snippet legend()}
				<span><i class="band"></i> Range</span>
				<span><i class="line average"></i> 1-day average</span>
			{/snippet}

			<path class="response-band" d={chart.bandPath} />
			<path class="response-line" d={chart.averageLinePath} />
		</ChartFrame>
	{/if}
</div>

<style>
	.chart-container {
		min-height: 360px;
	}

	.line {
		width: 24px;
		height: 2px;
		background: var(--color-text);
	}

	.line.average {
		height: 3px;
	}

	.band {
		width: 24px;
		height: 10px;
		border: 1px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
		background: color-mix(in srgb, var(--color-accent) 14%, transparent);
	}

	.response-band {
		fill: color-mix(in srgb, var(--color-accent) 13%, transparent);
		stroke: none;
	}

	.response-line {
		fill: none;
		stroke: var(--color-text);
		stroke-width: 3.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
