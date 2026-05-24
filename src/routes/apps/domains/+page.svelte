<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import CloudflareDomainChart from '$lib/CloudflareDomainChart.svelte';
	import CloudflareDomainTable from '$lib/CloudflareDomainTable.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import StatGrid from '$lib/StatGrid.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import type { PageCopy } from '$lib/copy';
	import { getDomainRunSummaries, getWeakestTlsDomain } from '$lib/cloudflareDomains';
	import copyData from './copy.yaml';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const copy = copyData as PageCopy<{
		overviewHeading: string;
		trendHeading: string;
		labels: { total: string; healthy: string; issues: string; lowestTls: string };
	}>;

	const runs = $derived(getDomainRunSummaries(data.domainData.history));
	const weakestTls = $derived(getWeakestTlsDomain(data.domainData.domains));
	const issueCount = $derived(data.domainData.summary.warn + data.domainData.summary.fail);
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header!} />

	<h2 class="stats-section">{copy.overviewHeading}</h2>

	<StatGrid label="Domain monitor summary">
		<StatItem label={copy.labels.total} value={data.domainData.summary.total} />
		<StatItem label={copy.labels.healthy} value={data.domainData.summary.ok} />
		<StatItem label={copy.labels.issues} value={issueCount} />
		<StatItem
			label={copy.labels.lowestTls}
			value={weakestTls?.tlsDaysLeft === null ? '—' : (weakestTls?.tlsDaysLeft ?? '—')}
			unit={weakestTls?.tlsDaysLeft === null || !weakestTls ? undefined : 'days'}
		/>
	</StatGrid>

	{#if runs.length > 0}
		<h2 class="stats-section">{copy.trendHeading}</h2>
		<CloudflareDomainChart {runs} />
	{/if}

	<CloudflareDomainTable domains={data.domainData.domains} />
</ArticlePage>
