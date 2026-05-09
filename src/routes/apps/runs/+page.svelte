<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import RunsChart from '$lib/RunsChart.svelte';
	import RunsTable from '$lib/RunsTable.svelte';
	import Seo from '$lib/Seo.svelte';
	import SiteFooter from '$lib/SiteFooter.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import { runs, parseRunDate, parseDistanceMiles } from '$lib/runs';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

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

<Seo
	title="Runs Log | Kip"
	description="Ben Welsh's running log — distances, routes, and reflections."
	url="https://kip.computer/apps/runs/"
/>

<SiteHeader />

<ArticlePage wide>
	<PageHeader
		title="Runs Log"
		deck="Distances, routes, and reflections from Ben's runs"
	/>

	<h2 class="stats-section">Summary</h2>

	<section class="summary" aria-label="Running summary">
		<StatItem label="Total runs" value={sortedRuns.length.toString()} />
		<StatItem label="Total distance" value={totalMiles.toFixed(0)} unit="mi" />
		<StatItem label="Average distance" value={averageMiles.toFixed(1)} unit="mi" />
		<StatItem label="Latest run" value={latestRun ? formatDate.format(parseRunDate(latestRun.date)) : '—'} />
	</section>

	{#if sortedRuns.length > 0}
		<RunsChart chart={data.runsChart} />
	{/if}

	<RunsTable {runs} />
</ArticlePage>

<SiteFooter />

<style>
	.summary {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-5);
		margin-bottom: var(--space-6);
		border-top: 2px solid var(--color-text);
		border-bottom: 1px solid var(--color-line);
		padding: var(--space-4) 0;
	}

	h2.stats-section {
		font-size: var(--font-size-3xl);
	}

	@media (max-width: 900px) {
		.summary {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 760px) {
		.summary {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--space-3);
		}
	}
</style>
