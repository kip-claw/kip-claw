<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import RunsChart from '$lib/RunsChart.svelte';
	import RunsTable from '$lib/RunsTable.svelte';
	import Seo from '$lib/Seo.svelte';
	import StatGrid from '$lib/StatGrid.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import type { HeaderCopy, SeoCopy } from '$lib/copy';
	import { runs, parseRunDate, parseDistanceMiles } from '$lib/runs';
	import copyData from './copy.yaml';

	const copy = copyData as {
		seo: SeoCopy;
		header: HeaderCopy;
		summaryHeading: string;
		labels: {
			totalRuns: string;
			totalDistance: string;
			averageDistance: string;
			latestRun: string;
		};
	};

	const sortedRuns = [...runs]
		.filter((r) => r.date && !isNaN(+parseRunDate(r.date)))
		.sort((a, b) => +parseRunDate(a.date) - +parseRunDate(b.date));

	const totalMiles = sortedRuns.reduce((sum, r) => sum + parseDistanceMiles(r.distance), 0);
	const averageMiles = sortedRuns.length > 0 ? totalMiles / sortedRuns.length : 0;
	const latestRun = sortedRuns.at(-1);

	const formatDate = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header} />

	<h2 class="stats-section">{copy.summaryHeading}</h2>

	<StatGrid label="Running summary">
		<StatItem label={copy.labels.totalRuns} value={sortedRuns.length.toString()} />
		<StatItem label={copy.labels.totalDistance} value={totalMiles.toFixed(0)} unit="mi" />
		<StatItem label={copy.labels.averageDistance} value={averageMiles.toFixed(1)} unit="mi" />
		<StatItem
			label={copy.labels.latestRun}
			value={latestRun ? formatDate.format(parseRunDate(latestRun.date)) : '—'}
		/>
	</StatGrid>

	{#if sortedRuns.length > 0}
		<RunsChart {runs} />
	{/if}

	<RunsTable {runs} />
</ArticlePage>

