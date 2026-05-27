<script lang="ts">
	import ChartFrame from './ChartFrame.svelte';
	import { buildTweetChart } from './tweetChart';
	import type { MonthlyTweetCount } from './twitterArchive';
	import { createContainerWidth } from './useContainerWidth.svelte';

	type Props = {
		monthly: MonthlyTweetCount[];
	};

	let { monthly }: Props = $props();

	const container = createContainerWidth();
	const chart = $derived(container.width > 0 ? buildTweetChart(monthly, container.width) : null);
</script>

<div use:container.action class="chart-container">
	{#if chart}
		<ChartFrame
			{chart}
			chartId="tweet-chart"
			heading="Tweets by month"
			title="Monthly tweet volume with 12-month rolling average"
			desc="Each bar shows the number of tweets posted that month. The line shows the trailing 12-month rolling average."
			axisTitle="Tweets"
		>
			{#snippet legend()}
				<span><i class="bar"></i> Monthly</span>
				<span><i class="line"></i> 12-month avg</span>
			{/snippet}

			{#each chart.bars as bar}
				<rect class="tweet-bar" x={bar.x} y={bar.y} width={bar.width} height={bar.height}>
					<title>{bar.title}</title>
				</rect>
			{/each}
			<path class="average-line" d={chart.averagePath} />
		</ChartFrame>
	{/if}
</div>

<style>
	.chart-container {
		min-height: 360px;
	}

	.bar {
		width: 10px;
		height: 14px;
		background: var(--color-accent);
		opacity: 0.6;
		border-radius: 1px;
	}

	.line {
		width: 24px;
		height: 2px;
		background: var(--color-text);
	}

	.tweet-bar {
		fill: var(--color-accent);
		fill-opacity: 0.55;
	}

	.average-line {
		fill: none;
		stroke: var(--color-text);
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
