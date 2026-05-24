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
			title="Average HTTPS response time across monitored domains"
			desc="Each dot shows one monitoring run. The line tracks average HTTPS response time across all Cloudflare-managed domains."
			axisTitle="Milliseconds"
		>
			{#snippet legend()}
				<span><i class="line"></i> Average response</span>
				<span><i class="dot"></i> Monitoring run</span>
			{/snippet}

			<path class="response-line" d={chart.linePath} />
			{#each chart.points as point}
				<circle class="run-dot" cx={point.x} cy={point.y} r={point.r}>
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
		width: 24px;
		height: 2px;
		background: var(--color-text);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: var(--color-accent);
	}

	.response-line {
		fill: none;
		stroke: var(--color-text);
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.run-dot {
		fill: var(--color-accent);
		stroke: var(--color-background);
		stroke-width: 1.5;
	}
</style>
