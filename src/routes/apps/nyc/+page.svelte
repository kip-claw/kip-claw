<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import NycMap from '$lib/NycMap.svelte';
	import NycTable from '$lib/NycTable.svelte';
	import type { HeaderCopy, SeoCopy } from '$lib/copy';
	import { nycPlaces, isYes, getPlaceTier } from '$lib/nycList';
	import type { NycPlace } from '$lib/nycList';
	import copyData from './copy.yaml';
	import 'maplibre-gl/dist/maplibre-gl.css';

	const copy = copyData as {
		seo: SeoCopy;
		header: HeaderCopy;
		overviewHeading: string;
		labels: { totalPlaces: string; elite: string; recommended: string; closed: string };
	};

	let selectedPlace = $state<NycPlace | null>(null);
	let searchQuery = $state('');
	let showClosed = $state(false);
	let tierFilter = $state<string[]>([]);

	const filteredPlaces = $derived.by(() => {
		let result = nycPlaces;

		if (searchQuery.trim()) {
			const q = searchQuery.trim().toLowerCase();
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					p.address.toLowerCase().includes(q) ||
					p.notes.toLowerCase().includes(q)
			);
		}

		if (!showClosed) {
			result = result.filter((p) => !isYes(p.isClosed));
		}

		if (tierFilter.length > 0) {
			result = result.filter((p) => tierFilter.includes(getPlaceTier(p)));
		}

		return result;
	});

	const openPlaces = nycPlaces.filter((p) => !isYes(p.isClosed));
	const eliteCount = openPlaces.filter((p) => getPlaceTier(p) === 'elite').length;
	const recommendedCount = openPlaces.filter((p) => getPlaceTier(p) === 'recommended').length;
	const closedCount = nycPlaces.filter((p) => isYes(p.isClosed)).length;

	const handlePlaceSelect = (place: NycPlace) => {
		selectedPlace = place;
	};
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header} />

	<h2 class="stats-section">{copy.overviewHeading}</h2>

	<section class="summary" aria-label="NYC list summary">
		<StatItem label={copy.labels.totalPlaces} value={nycPlaces.length.toString()} />
		<StatItem label={copy.labels.elite} value={eliteCount.toString()} />
		<StatItem label={copy.labels.recommended} value={recommendedCount.toString()} />
		<StatItem label={copy.labels.closed} value={closedCount.toString()} />
	</section>

	<NycMap places={filteredPlaces} {selectedPlace} onPlaceSelect={handlePlaceSelect} />
	<NycTable
		places={filteredPlaces}
		totalCount={nycPlaces.length}
		bind:searchQuery
		bind:showClosed
		bind:tierFilter
		onPlaceSelect={handlePlaceSelect}
	/>
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
