<script lang="ts">
	import DataTable, { type DataTableColumn } from './DataTable.svelte';
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

	let {
		places,
		totalCount,
		searchQuery = $bindable(''),
		showClosed = $bindable(false),
		tierFilter = $bindable([]),
		onPlaceSelect
	}: Props = $props();

	const tiers = [
		{ key: 'elite', label: 'Elite' },
		{ key: 'recommended', label: 'Recommended' },
		{ key: 'decent', label: 'Decent' },
		{ key: 'meh', label: 'Meh' }
	] as const;

	const columns: DataTableColumn<NycPlace>[] = [
		{ key: 'name', label: 'Name', sortable: true },
		{ key: 'address', label: 'Address', sortable: true },
		{ key: 'tier', label: 'Tier' },
		{ key: 'notes', label: 'Notes' }
	];

	const toggleTier = (tier: string) => {
		if (tierFilter.includes(tier)) {
			tierFilter = tierFilter.filter((t) => t !== tier);
		} else {
			tierFilter = [...tierFilter, tier];
		}
	};

	const rowClass = (place: NycPlace) => (isYes(place.isClosed) ? 'closed' : undefined);
	const handleRowClick = onPlaceSelect ? (p: NycPlace) => onPlaceSelect(p) : undefined;
</script>

<DataTable
	rows={places}
	{columns}
	heading="Places"
	headingId="nyc-table-title"
	countText="{places.length} of {totalCount} places"
	initialSortKey="name"
	initialSortDirection="asc"
	onRowClick={handleRowClick}
	{rowClass}
>
	{#snippet controls()}
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
	{/snippet}

	{#snippet row(place: NycPlace)}
		<td class="no-wrap">{place.name}</td>
		<td>{place.address}</td>
		<td><span class="badge badge--{getPlaceTier(place)}">{getPlaceTier(place)}</span></td>
		<td>{place.notes}</td>
	{/snippet}
</DataTable>

<style>
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

	:global(.table-section tr.closed) {
		opacity: 0.5;
	}

	:global(.table-section .badge) {
		display: inline-block;
		padding: 1px 8px;
		border-radius: 999px;
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		white-space: nowrap;
	}

	:global(.table-section .badge--elite) {
		background: #fff8e1;
		color: #f9a825;
	}
	:global(.table-section .badge--recommended) {
		background: #e8f5e9;
		color: #2e7d32;
	}
	:global(.table-section .badge--decent) {
		background: #e3f2fd;
		color: #1565c0;
	}
	:global(.table-section .badge--meh) {
		background: #f5f5f5;
		color: #757575;
	}

	@media (max-width: 760px) {
		.filter-row {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
