<script lang="ts">
	import type { Cigar } from './humidor';

	type Props = {
		cigars: Cigar[];
	};

	type SortKey = keyof Cigar;

	let { cigars }: Props = $props();
	let sortKey = $state<SortKey>('dateAdded');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	const headers: { key: SortKey; label: string }[] = [
		{ key: 'dateAdded', label: 'Date Added' },
		{ key: 'maker', label: 'Maker' },
		{ key: 'model', label: 'Model' },
		{ key: 'wrapper', label: 'Wrapper' },
		{ key: 'origin', label: 'Origin' },
		{ key: 'size', label: 'Size' },
		{ key: 'gauge', label: 'Gauge' }
	];

	const sortedCigars = $derived(
		[...cigars].sort((a, b) => {
			const direction = sortDirection === 'asc' ? 1 : -1;
			const aValue = a[sortKey];
			const bValue = b[sortKey];
			return String(aValue).localeCompare(String(bValue)) * direction;
		})
	);

	const sortBy = (key: SortKey) => {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			return;
		}

		sortKey = key;
		sortDirection = key === 'dateAdded' ? 'desc' : 'asc';
	};
</script>

<section class="table-section" aria-labelledby="cigar-table-title">
	<div class="table-heading">
		<h3 id="cigar-table-title">Inventory</h3>
	</div>
	<div class="table-frame">
		<table>
			<thead>
				<tr>
					{#each headers as header}
						<th
							aria-sort={sortKey === header.key
								? sortDirection === 'asc'
									? 'ascending'
									: 'descending'
								: undefined}
						>
							<button type="button" onclick={() => sortBy(header.key)}>
								<span>{header.label}</span>
								<span class="sort-mark" aria-hidden="true">
									{sortKey === header.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
								</span>
							</button>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each sortedCigars as cigar}
					<tr>
						<td>{cigar.dateAdded}</td>
						<td>{cigar.maker}</td>
						<td>{cigar.model}</td>
						<td>{cigar.wrapper}</td>
						<td>{cigar.origin}</td>
						<td>{cigar.size}</td>
						<td>{cigar.gauge}</td>
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

	.table-frame {
		overflow-x: auto;
		overflow-y: auto;
		height: 600px;
		border-top: 2px solid var(--color-text);
	}

	table {
		width: 100%;
		min-width: 820px;
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

	.sort-mark {
		color: var(--color-accent);
		font-size: var(--font-size-xs);
	}

	@media (max-width: 760px) {
		.table-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-1);
		}
	}
</style>
