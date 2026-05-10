<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import CigarTable from '$lib/CigarTable.svelte';
	import HumidityChart from '$lib/HumidityChart.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import StatGrid from '$lib/StatGrid.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import type { PageCopy } from '$lib/copy';
	import { getHumidorSummary } from '$lib/humidor';
	import copyData from './copy.yaml';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const copy = copyData as PageCopy<{
		conditionsHeading: string;
		labels: { latestRh: string; averageRh: string; cigars: string; bovedaAge: string };
	}>;

	const summary = $derived(getHumidorSummary(data.humidor));
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header!} />

	<h2 class="stats-section">{copy.conditionsHeading}</h2>

	<StatGrid label="Humidor conditions summary">
		<StatItem
			label={copy.labels.latestRh}
			value={isNaN(summary.latestRh) ? '—' : summary.latestRh.toFixed(0)}
			unit="%"
		/>
		<StatItem
			label={copy.labels.averageRh}
			value={isNaN(summary.averageRh) ? '—' : summary.averageRh.toFixed(0)}
			unit="%"
		/>
		<StatItem label={copy.labels.cigars} value={summary.cigarCount.toString()} />
		<StatItem
			label={copy.labels.bovedaAge}
			value={isNaN(summary.daysSinceBoveda) ? '—' : summary.daysSinceBoveda.toString()}
			unit="days"
		/>
	</StatGrid>

	{#if summary.sortedReadings.length > 0}
		<HumidityChart readings={data.humidor.humidityReadings} />
	{/if}

	<CigarTable cigars={data.humidor.cigars} />
</ArticlePage>
