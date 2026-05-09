<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import CigarTable from '$lib/CigarTable.svelte';
	import HumidityChart from '$lib/HumidityChart.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import { cigars, humidityReadings, bovedaChanges, parseHumidityDate } from '$lib/humidor';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

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

<Seo
	title="Cigar Humidor | Kip"
	description="Cigar inventory and humidity readings from Ben Welsh's humidor."
	url="https://kip.computer/apps/humidor/"
/>

<ArticlePage wide>
	<PageHeader
		eyebrow="Apps"
		title="Cigar Humidor"
		deck="Inventory and humidity readings from Ben's humidor"
	/>

	<h2 class="stats-section">Current conditions</h2>

	<section class="summary" aria-label="Humidor conditions summary">
		<StatItem label="Latest RH" value={isNaN(latestRh) ? '—' : latestRh.toFixed(0)} unit="%" />
		<StatItem label="Average RH" value={isNaN(averageRh) ? '—' : averageRh.toFixed(0)} unit="%" />
		<StatItem label="Cigars" value={cigarCount.toString()} />
		<StatItem label="Boveda age" value={isNaN(daysSinceBoveda) ? '—' : daysSinceBoveda.toString()} unit="days" />
	</section>

	{#if sortedReadings.length > 0}
		<HumidityChart chart={data.humidityChart} />
	{/if}

	<CigarTable {cigars} />
</ArticlePage>

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
