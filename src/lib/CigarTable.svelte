<script lang="ts">
	import DataTable, { type DataTableColumn } from './DataTable.svelte';
	import type { Cigar } from './humidor';

	type Props = {
		cigars: Cigar[];
	};

	let { cigars }: Props = $props();

	const columns: DataTableColumn<Cigar>[] = [
		{ key: 'dateAdded', label: 'Date Added', sortable: true },
		{ key: 'maker', label: 'Maker', sortable: true },
		{ key: 'model', label: 'Model', sortable: true },
		{ key: 'wrapper', label: 'Wrapper', sortable: true },
		{ key: 'origin', label: 'Origin', sortable: true },
		{ key: 'size', label: 'Size', sortable: true },
		{ key: 'gauge', label: 'Gauge', sortable: true }
	];
</script>

<DataTable
	rows={cigars}
	{columns}
	heading="Inventory"
	headingId="cigar-table-title"
	initialSortKey="dateAdded"
	initialSortDirection="desc"
>
	{#snippet row(cigar: Cigar)}
		<td>{cigar.dateAdded}</td>
		<td>{cigar.maker}</td>
		<td>{cigar.model}</td>
		<td>{cigar.wrapper}</td>
		<td>{cigar.origin}</td>
		<td>{cigar.size}</td>
		<td>{cigar.gauge}</td>
	{/snippet}
</DataTable>
