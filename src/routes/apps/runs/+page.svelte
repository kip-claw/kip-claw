<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import RunsChart from '$lib/RunsChart.svelte';
	import RunsTable from '$lib/RunsTable.svelte';
	import Seo from '$lib/Seo.svelte';
	import StatGrid from '$lib/StatGrid.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import type { PageCopy } from '$lib/copy';
	import { getRunsSummary, parseRunDate } from '$lib/runs';
	import copyData from './copy.yaml';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const copy = copyData as PageCopy<{
		summaryHeading: string;
		labels: {
			totalRuns: string;
			totalDistance: string;
			averageDistance: string;
			latestRun: string;
		};
	}>;

	const summary = $derived(getRunsSummary(data.runs));

	const formatDate = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header!} />

	<h2 class="stats-section">{copy.summaryHeading}</h2>

	<StatGrid label="Running summary">
		<StatItem label={copy.labels.totalRuns} value={summary.sortedRuns.length.toString()} />
		<StatItem label={copy.labels.totalDistance} value={summary.totalMiles.toFixed(0)} unit="mi" />
		<StatItem
			label={copy.labels.averageDistance}
			value={summary.averageMiles.toFixed(1)}
			unit="mi"
		/>
		<StatItem
			label={copy.labels.latestRun}
			value={summary.latestRun ? formatDate.format(parseRunDate(summary.latestRun.date)) : '—'}
		/>
	</StatGrid>

	{#if summary.sortedRuns.length > 0}
		<RunsChart runs={data.runs} />
	{/if}

	<RunsTable runs={data.runs} />
</ArticlePage>
