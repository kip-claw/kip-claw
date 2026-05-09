<script lang="ts">
	import type { NycPlace } from './nycList';
	import { isYes, getPlaceTier } from './nycList';

	type Props = {
		places: NycPlace[];
		totalCount: number;
		searchQuery: string;
		showClosed: boolean;
		tierFilter: string[];
		onPlaceSelect?: (place: NycPlace) => void;
	};

	let { places, totalCount, searchQuery = $bindable(''), showClosed = $bindable(false), tierFilter = $bindable([]), onPlaceSelect }: Props = $props();

	let sortKey = $state<'name' | 'address'>('name');
	let sortDirection = $state<'asc' | 'desc'>('asc');

	const tiers = [
		{ key: 'elite', label: 'Elite' },
		{ key: 'recommended', label: 'Recommended' },
		{ key: 'decent', label: 'Decent' },
		{ key: 'other', label: 'Other' }
	] as const;

	const sortedPlaces = $derived.by(() => {
		const dir = sortDirection === 'asc' ? 1 : -1;
		return [...places].sort((a, b) => {
			return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
		});
	});

	const toggleTier = (tier: string) => {
		if (tierFilter.includes(tier)) {
			tierFilter = tierFilter.filter((t) => t !== tier);
		} else {
			tierFilter = [...tierFilter, tier];
		}
	};

	const sortBy = (key: 'name' | 'address') => {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
	};

	const tierBadgeClass = (place: NycPlace): string => {
		return `badge badge--${getPlaceTier(place)}`;
	};
</script>

<section class="table-section" aria-labelledby="nyc-table-title">
	<div class="table-heading">
		<h3 id="nyc-table-title">Places</h3>
		<p>{places.length} of {totalCount} places</p>
	</div>

	<div class="controls">
		<input
			type="search"
			placeholder="Search by name, address, or notes…"
			bind:value={searchQuery}
			class="search-input"
		/>
		<div class="filter-row">
			<div class="tier-filters">
				{#each tiers as tier}
					<button
						type="button"
						class="filter-btn"
						class:active={tierFilter.includes(tier.key)}
						onclick={() => toggleTier(tier.key)}
					>
						{tier.label}
					</button>
				{/each}
			</div>
			<label class="closed-toggle">
				<input type="checkbox" bind:checked={showClosed} />
				Show closed
			</label>
		</div>
	</div>

	<div class="table-frame">
		<table>
			<thead>
				<tr>
					<th>
						<button type="button" onclick={() => sortBy('name')}>
							<span>Name</span>
							<span class="sort-mark" aria-hidden="true">
								{sortKey === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
							</span>
						</button>
					</th>
					<th>
						<button type="button" onclick={() => sortBy('address')}>
							<span>Address</span>
							<span class="sort-mark" aria-hidden="true">
								{sortKey === 'address' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
							</span>
						</button>
					</th>
					<th>Tier</th>
					<th>Notes</th>
				</tr>
			</thead>
			<tbody>
				{#each sortedPlaces as place}
					<tr
						class:closed={isYes(place.isClosed)}
						class:clickable={place.lat != null}
						onclick={() => onPlaceSelect?.(place)}
					>
						<td class="no-wrap">{place.name}</td>
						<td>{place.address}</td>
						<td><span class={tierBadgeClass(place)}>{getPlaceTier(place)}</span></td>
						<td>{place.notes}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style lang="scss">
	.table-section {
		margin-bottom: var(--space-8);

		h3 {
			margin: 0;
			font-size: var(--font-size-xl);
			line-height: var(--line-height-snug);
		}

		.table-heading {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			gap: var(--space-4);
			margin-bottom: var(--space-3);

			p {
				margin: 0;
				color: var(--color-muted);
				font-size: var(--font-size-xs);
			}
		}
	}

	.controls {
		margin-bottom: var(--space-4);
	}

	.search-input {
		width: 100%;
		padding: var(--space-3);
		border: 1px solid var(--color-line);
		border-radius: 4px;
		font-size: var(--font-size-sm);
		font-family: inherit;
		background: var(--color-background);
		color: var(--color-text);
		margin-bottom: var(--space-3);
	}

	.search-input:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: -1px;
	}

	.filter-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.tier-filters {
		display: flex;
		gap: var(--space-2);
	}

	.filter-btn {
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-line);
		border-radius: 999px;
		background: var(--color-background);
		color: var(--color-muted);
		font-size: var(--font-size-xs);
		font-family: inherit;
		cursor: pointer;
	}

	.filter-btn.active {
		background: var(--color-text);
		color: var(--color-background);
		border-color: var(--color-text);
	}

	.closed-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-muted);
		font-size: var(--font-size-xs);
		cursor: pointer;
	}

	.table-frame {
		overflow-x: auto;
		overflow-y: auto;
		max-height: 600px;
		border-top: 2px solid var(--color-text);
	}

	table {
		width: 100%;
		min-width: 700px;
		border-collapse: collapse;
		font-size: var(--font-size-sm);
	}

	th,
	td {
		border-bottom: 1px solid var(--color-line);
		padding: var(--space-3) var(--space-2);
		text-align: left;
		vertical-align: top;
	}

	th {
		position: sticky;
		top: 0;
		background: var(--color-background);
		color: var(--color-muted);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
	}

	th button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: inherit;
		text-transform: inherit;
		cursor: pointer;
	}

	th button:hover {
		color: var(--color-text);
	}

	.no-wrap {
		white-space: nowrap;
	}

	.sort-mark {
		color: var(--color-accent);
		font-size: var(--font-size-xs);
	}

	tr.closed {
		opacity: 0.5;
	}

	tr.clickable {
		cursor: pointer;
	}

	tr.clickable:hover td {
		background: rgba(0, 0, 0, 0.03);
	}

	.badge {
		display: inline-block;
		padding: 1px 8px;
		border-radius: 999px;
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		white-space: nowrap;
	}

	.badge--elite {
		background: #fff8e1;
		color: #f9a825;
	}
	.badge--recommended {
		background: #e8f5e9;
		color: #2e7d32;
	}
	.badge--decent {
		background: #e3f2fd;
		color: #1565c0;
	}
	.badge--other {
		background: #f5f5f5;
		color: #757575;
	}

	@media (max-width: 760px) {
		.table-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-1);
		}

		.filter-row {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
