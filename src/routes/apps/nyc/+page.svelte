<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import StatGrid from '$lib/StatGrid.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import NycMap from '$lib/NycMap.svelte';
	import NycTable from '$lib/NycTable.svelte';
	import type { PageCopy } from '$lib/copy';
	import { isYes, getPlaceTier } from '$lib/nycList';
	import type { NycPlace } from '$lib/nycList';
	import copyData from './copy.yaml';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const copy = copyData as PageCopy<{
		overviewHeading: string;
		labels: { totalPlaces: string; elite: string; recommended: string; decent: string };
	}>;

	let selectedPlace = $state<NycPlace | null>(null);
	let searchQuery = $state('');
	let showClosed = $state(false);
	let tierFilter = $state<string[]>([]);

	const filteredPlaces = $derived.by(() => {
		let result = data.places;

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

	const openPlaces = $derived(data.places.filter((p) => !isYes(p.isClosed)));
	const eliteCount = $derived(openPlaces.filter((p) => getPlaceTier(p) === 'elite').length);
	const recommendedCount = $derived(
		openPlaces.filter((p) => getPlaceTier(p) === 'recommended').length
	);
	const decentCount = $derived(openPlaces.filter((p) => getPlaceTier(p) === 'decent').length);

	const handlePlaceSelect = (place: NycPlace) => {
		selectedPlace = place;
	};
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header!} />

	<h2 class="stats-section">{copy.overviewHeading}</h2>

	<StatGrid label="NYC list summary">
		<StatItem label={copy.labels.totalPlaces} value={data.places.length.toString()} />
		<StatItem label={copy.labels.elite} value={eliteCount.toString()} />
		<StatItem label={copy.labels.recommended} value={recommendedCount.toString()} />
		<StatItem label={copy.labels.decent} value={decentCount.toString()} />
	</StatGrid>

	<NycMap places={filteredPlaces} {selectedPlace} onPlaceSelect={handlePlaceSelect} />
	<NycTable
		places={filteredPlaces}
		totalCount={data.places.length}
		bind:searchQuery
		bind:showClosed
		bind:tierFilter
		onPlaceSelect={handlePlaceSelect}
	/>
</ArticlePage>
