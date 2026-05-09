<script lang="ts">
	import { onMount } from 'svelte';
	import type { NycPlace } from './nycList';
	import { getPlaceTier, tierColors, isYes } from './nycList';

	type Props = {
		places: NycPlace[];
		selectedPlace?: NycPlace | null;
		onPlaceSelect?: (place: NycPlace) => void;
	};

	let { places, selectedPlace = null, onPlaceSelect }: Props = $props();
	let mapContainer: HTMLDivElement;
	let map: any;
	let markers: any[] = [];

	onMount(async () => {
		const maplibregl = await import('maplibre-gl');
		const { Protocol } = await import('pmtiles');

		const protocol = new Protocol();
		maplibregl.addProtocol('pmtiles', protocol.tile);

		map = new maplibregl.Map({
			container: mapContainer,
			style: '/nyc-map-style.json',
			center: [-73.985, 40.748],
			zoom: 11,
			minZoom: 10,
			maxZoom: 18,
			attributionControl: false
		});

		map.addControl(new maplibregl.NavigationControl(), 'top-right');

		map.on('load', () => {
			addMarkers(maplibregl, places);
		});

		return () => {
			markers.forEach((m) => m.remove());
			map?.remove();
		};
	});

	function addMarkers(maplibregl: any, placesToRender: NycPlace[]) {
		markers.forEach((m) => m.remove());
		markers = [];

		for (const place of placesToRender) {
			if (place.lat == null || place.lng == null) continue;

			const tier = getPlaceTier(place);
			const color = tierColors[tier];
			const closed = isYes(place.isClosed);

			const el = document.createElement('div');
			el.className = 'nyc-marker';
			el.style.width = '14px';
			el.style.height = '14px';
			el.style.borderRadius = '50%';
			el.style.backgroundColor = color;
			el.style.border = '2px solid white';
			el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
			el.style.cursor = 'pointer';
			if (closed) el.style.opacity = '0.4';

			const popup = new maplibregl.Popup({ offset: 12, maxWidth: '260px' }).setHTML(
				`<strong>${escapeHtml(place.name)}</strong>` +
					(closed ? ' <em>(closed)</em>' : '') +
					`<br><small>${escapeHtml(place.address)}</small>` +
					(place.notes ? `<br><span style="color:#666">${escapeHtml(place.notes)}</span>` : '')
			);

			const marker = new maplibregl.Marker({ element: el })
				.setLngLat([place.lng, place.lat])
				.setPopup(popup)
				.addTo(map);

			el.addEventListener('click', () => {
				onPlaceSelect?.(place);
			});

			markers.push(marker);
		}
	}

	function escapeHtml(text: string): string {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	$effect(() => {
		if (map && selectedPlace?.lat != null && selectedPlace?.lng != null) {
			map.flyTo({ center: [selectedPlace.lng, selectedPlace.lat], zoom: 15, duration: 800 });
			// Open the popup for the selected marker
			const idx = places.filter((p) => p.lat != null && p.lng != null).indexOf(selectedPlace);
			if (idx >= 0 && markers[idx]) {
				markers[idx].togglePopup();
			}
		}
	});

	// Re-render markers when filtered places change
	$effect(() => {
		// Read places to register as a dependency
		const _places = places;
		if (map && map.loaded()) {
			import('maplibre-gl').then((maplibregl) => {
				addMarkers(maplibregl, _places);
			});
		}
	});
</script>

<div class="map-wrapper">
	<div bind:this={mapContainer} class="map-container"></div>
	<div class="map-legend">
		<span><i class="legend-dot" style="background:{tierColors.elite}"></i> Elite</span>
		<span><i class="legend-dot" style="background:{tierColors.recommended}"></i> Recommended</span>
		<span><i class="legend-dot" style="background:{tierColors.decent}"></i> Decent</span>
		<span><i class="legend-dot" style="background:{tierColors.other}"></i> Other</span>
	</div>
</div>

<style>
	.map-wrapper {
		margin-bottom: var(--space-6);
	}

	.map-container {
		width: 100%;
		height: 500px;
		border-radius: var(--radius-card, 8px);
		border: 1px solid var(--color-line);
	}

	.map-legend {
		display: flex;
		gap: var(--space-4);
		margin-top: var(--space-3);
		color: var(--color-muted);
		font-size: var(--font-size-xs);
	}

	.map-legend span {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.legend-dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 1.5px solid white;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 760px) {
		.map-container {
			height: 350px;
		}

		.map-legend {
			flex-wrap: wrap;
		}
	}
</style>
