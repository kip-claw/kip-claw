<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import SiteFooter from '$lib/SiteFooter.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import NycMap from '$lib/NycMap.svelte';
	import NycTable from '$lib/NycTable.svelte';
	import { nycPlaces, isYes, getPlaceTier } from '$lib/nycList';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let selectedPlace = $state<import('$lib/nycList').NycPlace | null>(null);

	const openPlaces = nycPlaces.filter((p) => !isYes(p.isClosed));
	const eliteCount = openPlaces.filter((p) => getPlaceTier(p) === 'elite').length;
	const recommendedCount = openPlaces.filter((p) => getPlaceTier(p) === 'recommended').length;
	const closedCount = nycPlaces.filter((p) => isYes(p.isClosed)).length;

	const handlePlaceSelect = (place: import('$lib/nycList').NycPlace) => {
		selectedPlace = place;
	};
</script>

<Seo
	title="NYC List | Kip"
	description="Ben Welsh's curated guide to places in New York City."
	url="https://kip.computer/apps/nyc/"
/>

<SiteHeader />

<ArticlePage wide>
	<PageHeader
		title="NYC List"
		deck="Ben's curated guide to places in New York City"
	/>

	<h2 class="stats-section">Overview</h2>

	<section class="summary" aria-label="NYC list summary">
		<StatItem label="Total places" value={nycPlaces.length.toString()} />
		<StatItem label="Elite" value={eliteCount.toString()} />
		<StatItem label="Recommended" value={recommendedCount.toString()} />
		<StatItem label="Closed" value={closedCount.toString()} />
	</section>

	<NycMap places={nycPlaces} {selectedPlace} onPlaceSelect={handlePlaceSelect} />
	<NycTable places={nycPlaces} onPlaceSelect={handlePlaceSelect} />
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
