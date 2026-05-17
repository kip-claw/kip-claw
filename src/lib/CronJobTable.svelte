<script lang="ts">
	import DataTable, { type DataTableColumn } from './DataTable.svelte';
	import type { CronJobLatest } from './cronJobs';

	type Props = {
		jobs: CronJobLatest[];
	};

	let { jobs }: Props = $props();

	const columns: DataTableColumn<CronJobLatest>[] = [
		{ key: 'jobName', label: 'Job', sortable: true },
		{ key: 'status', label: 'Status', sortable: true },
		{
			key: 'durationS',
			label: 'Duration',
			sortable: true,
			numeric: true
		}
	];

	const formatDuration = (s: number): string => {
		if (s === 0) return '—';
		if (s < 60) return `${s.toFixed(0)}s`;
		const m = Math.floor(s / 60);
		const remainder = Math.round(s % 60);
		return remainder > 0 ? `${m}m ${remainder}s` : `${m}m`;
	};
</script>

<DataTable
	rows={jobs}
	{columns}
	heading="Latest results"
	headingId="cron-table-title"
	countText="{jobs.length} jobs"
	initialSortKey="jobName"
	initialSortDirection="asc"
	rowClass={(job) => (job.status === 'error' ? 'row-error' : undefined)}
>
	{#snippet row(job: CronJobLatest)}
		<td>{job.jobName}</td>
		<td>
			<span class="status-badge" data-status={job.status}>{job.status}</span>
		</td>
		<td class="numeric">{formatDuration(job.durationS)}</td>
	{/snippet}
</DataTable>

<style>
	.status-badge {
		display: inline-block;
		padding: 0.1em 0.5em;
		border-radius: 3px;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.status-badge[data-status='ok'] {
		background: #d4edda;
		color: #155724;
	}

	.status-badge[data-status='error'] {
		background: #f8d7da;
		color: #721c24;
	}

	.status-badge[data-status='idle'] {
		background: #e2e3e5;
		color: #383d41;
	}

	:global(.row-error) {
		background: #fff5f5;
	}
</style>
