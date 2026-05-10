<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	export type DataTableColumn<T> = {
		key: string;
		label: string;
		sortable?: boolean;
		numeric?: boolean;
		sortValue?: (row: T) => string | number;
	};

	type Props<T> = {
		rows: T[];
		columns: DataTableColumn<T>[];
		heading: string;
		headingId: string;
		countText?: string;
		initialSortKey?: string;
		initialSortDirection?: 'asc' | 'desc';
		onRowClick?: (row: T) => void;
		rowClass?: (row: T) => string | undefined;
		controls?: Snippet;
		row: Snippet<[T]>;
	};

	let {
		rows,
		columns,
		heading,
		headingId,
		countText,
		initialSortKey,
		initialSortDirection = 'asc',
		onRowClick,
		rowClass,
		controls,
		row
	}: Props<T> = $props();

	let sortKey = $state<string | undefined>(initialSortKey);
	let sortDirection = $state<'asc' | 'desc'>(initialSortDirection);

	const columnByKey = $derived(new Map(columns.map((c) => [c.key, c])));

	const defaultSortValue = (r: T, key: string): string | number => {
		const value = (r as Record<string, unknown>)[key];
		if (typeof value === 'number') return value;
		return String(value ?? '');
	};

	const sortedRows = $derived.by(() => {
		if (!sortKey) return rows;
		const column = columnByKey.get(sortKey);
		if (!column) return rows;
		const dir = sortDirection === 'asc' ? 1 : -1;
		const getValue = column.sortValue ?? ((r: T) => defaultSortValue(r, sortKey!));
		return [...rows].sort((a, b) => {
			const av = getValue(a);
			const bv = getValue(b);
			if (typeof av === 'number' && typeof bv === 'number') {
				return (av - bv) * dir;
			}
			return String(av).localeCompare(String(bv)) * dir;
		});
	});

	const sortBy = (column: DataTableColumn<T>) => {
		if (!column.sortable) return;
		if (sortKey === column.key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			return;
		}
		sortKey = column.key;
		sortDirection = 'asc';
	};
</script>

<section class="table-section" aria-labelledby={headingId}>
	<div class="table-heading">
		<h3 id={headingId}>{heading}</h3>
		{#if countText}
			<p class="count-text">{countText}</p>
		{/if}
	</div>

	{#if controls}
		<div class="controls">
			{@render controls()}
		</div>
	{/if}

	<div class="table-frame">
		<table>
			<thead>
				<tr>
					{#each columns as column}
						<th
							class:numeric={column.numeric}
							aria-sort={column.sortable && sortKey === column.key
								? sortDirection === 'asc'
									? 'ascending'
									: 'descending'
								: undefined}
						>
							{#if column.sortable}
								<button type="button" onclick={() => sortBy(column)}>
									<span>{column.label}</span>
									<span class="sort-mark" aria-hidden="true">
										{sortKey === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
									</span>
								</button>
							{:else}
								{column.label}
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each sortedRows as r}
					<tr class={rowClass?.(r)} class:clickable={!!onRowClick} onclick={() => onRowClick?.(r)}>
						{@render row(r)}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	.table-section {
		margin-bottom: var(--space-8);
	}

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
	}

	.table-heading p.count-text {
		margin: 0;
		color: var(--color-muted);
		font-size: var(--font-size-xs);
	}

	.controls {
		margin-bottom: var(--space-4);
	}

	.table-frame {
		overflow-x: auto;
		overflow-y: auto;
		max-height: 600px;
		border-top: 2px solid var(--color-text);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--font-size-sm);
	}

	:global(.table-section th),
	:global(.table-section td) {
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

	:global(.table-section .numeric) {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	:global(.table-section .no-wrap) {
		white-space: nowrap;
	}

	.sort-mark {
		color: var(--color-accent);
		font-size: var(--font-size-xs);
	}

	tr.clickable {
		cursor: pointer;
	}

	tr.clickable:hover td {
		background: rgba(0, 0, 0, 0.03);
	}

	@media (max-width: 760px) {
		.table-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-1);
		}
	}
</style>
