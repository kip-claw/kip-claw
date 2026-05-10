<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import CigarTable from '$lib/CigarTable.svelte';
	import HumidityChart from '$lib/HumidityChart.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import StatGrid from '$lib/StatGrid.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import type { HeaderCopy, SeoCopy } from '$lib/copy';
	import { cigars, humidityReadings, bovedaChanges, parseHumidityDate } from '$lib/humidor';
	import copyData from './copy.yaml';

	const copy = copyData as {
		seo: SeoCopy;
		header: HeaderCopy;
		conditionsHeading: string;
		labels: { latestRh: string; averageRh: string; cigars: string; bovedaAge: string };
	};

	const sortedReadings = [...humidityReadings]
		.filter((r) => !isNaN(parseFloat(r.rh)))
		.sort((a, b) => +parseHumidityDate(a.date, a.time || undefined) - +parseHumidityDate(b.date, b.time || undefined));

	const latestReading = sortedReadings.at(-1);
	const latestRh = latestReading ? parseFloat(latestReading.rh) : NaN;
	const cigarCount = cigars.length;

	const averageRh =
		sortedReadings.length > 0
			? sortedReadings.reduce((sum, r) => sum + parseFloat(r.rh), 0) / sortedReadings.length
			: NaN;

	const sortedBoveda = [...bovedaChanges]
		.filter((b) => b.dateChanged)
		.sort((a, b) => a.dateChanged.localeCompare(b.dateChanged));
	const latestBoveda = sortedBoveda.at(-1);
	const daysSinceBoveda = latestBoveda
		? Math.floor((Date.now() - +new Date(latestBoveda.dateChanged)) / (1000 * 60 * 60 * 24))
		: NaN;
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header} />

	<h2 class="stats-section">{copy.conditionsHeading}</h2>

	<StatGrid label="Humidor conditions summary">
		<StatItem label={copy.labels.latestRh} value={isNaN(latestRh) ? '—' : latestRh.toFixed(0)} unit="%" />
		<StatItem label={copy.labels.averageRh} value={isNaN(averageRh) ? '—' : averageRh.toFixed(0)} unit="%" />
		<StatItem label={copy.labels.cigars} value={cigarCount.toString()} />
		<StatItem label={copy.labels.bovedaAge} value={isNaN(daysSinceBoveda) ? '—' : daysSinceBoveda.toString()} unit="days" />
	</StatGrid>

	{#if sortedReadings.length > 0}
		<HumidityChart readings={humidityReadings} />
	{/if}

	<CigarTable {cigars} />
</ArticlePage>

