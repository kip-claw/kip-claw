<script lang="ts">
	import DataTable, { type DataTableColumn } from './DataTable.svelte';
	import type { SpeedTest } from './speedTests';
	import { parseSpeedTestDate } from './speedTests';

	type Props = {
		tests: SpeedTest[];
	};

	let { tests }: Props = $props();

	const columns: DataTableColumn<SpeedTest>[] = [
		{
			key: 'timestamp',
			label: 'Time',
			sortable: true,
			sortValue: (t) => +parseSpeedTestDate(t.timestamp)
		},
		{ key: 'downloadMbps', label: 'Download', sortable: true, numeric: true },
		{ key: 'uploadMbps', label: 'Upload', sortable: true, numeric: true },
		{ key: 'pingMs', label: 'Ping', sortable: true, numeric: true },
		{ key: 'server', label: 'Server', sortable: true },
		{ key: 'provider', label: 'Provider', sortable: true }
	];

	const formatDateTime = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});
</script>

<DataTable
	rows={tests}
	{columns}
	heading="Log"
	headingId="speed-table-title"
	countText="{tests.length} tests logged"
	initialSortKey="timestamp"
	initialSortDirection="desc"
>
	{#snippet row(test: SpeedTest)}
		<td>{formatDateTime.format(parseSpeedTestDate(test.timestamp))}</td>
		<td class="numeric">{test.downloadMbps.toFixed(2)}</td>
		<td class="numeric">{test.uploadMbps.toFixed(2)}</td>
		<td class="numeric">{test.pingMs.toFixed(1)}</td>
		<td>{test.server}</td>
		<td>{test.provider}</td>
	{/snippet}
</DataTable>
