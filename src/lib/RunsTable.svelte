<script lang="ts">
	import DataTable, { type DataTableColumn } from './DataTable.svelte';
	import type { Run } from './runs';
	import { parseRunDate } from './runs';

	type Props = {
		runs: Run[];
	};

	let { runs }: Props = $props();

	const columns: DataTableColumn<Run>[] = [
		{
			key: 'date',
			label: 'Date',
			sortable: true,
			sortValue: (r) => +parseRunDate(r.date)
		},
		{ key: 'distance', label: 'Distance', sortable: true },
		{ key: 'route', label: 'Route', sortable: true }
	];

	const formatDate = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
</script>

<DataTable
	rows={runs}
	{columns}
	heading="Activity"
	headingId="runs-table-title"
	countText="{runs.length} runs logged"
	initialSortKey="date"
	initialSortDirection="desc"
>
	{#snippet row(run: Run)}
		<td class="no-wrap">{formatDate.format(parseRunDate(run.date))}</td>
		<td class="no-wrap">{run.distance}</td>
		<td>{run.route}</td>
	{/snippet}
</DataTable>
