<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import StatGrid from '$lib/StatGrid.svelte';
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
		labels: { totalPlaces: string; elite: string; recommended: string; decent: string };
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
	const decentCount = openPlaces.filter((p) => getPlaceTier(p) === 'decent').length;

	const handlePlaceSelect = (place: NycPlace) => {
		selectedPlace = place;
	};
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header} />

	<h2 class="stats-section">{copy.overviewHeading}</h2>

	<StatGrid label="NYC list summary">
		<StatItem label={copy.labels.totalPlaces} value={nycPlaces.length.toString()} />
		<StatItem label={copy.labels.elite} value={eliteCount.toString()} />
		<StatItem label={copy.labels.recommended} value={recommendedCount.toString()} />
		<StatItem label={copy.labels.decent} value={decentCount.toString()} />
	</StatGrid>

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
