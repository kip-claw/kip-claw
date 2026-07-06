<script lang="ts">
	import DataTable, { type DataTableColumn } from './DataTable.svelte';
	import type { CloudflareDomainCheck } from './cloudflareDomains';

	type Props = {
		domains: CloudflareDomainCheck[];
	};

	let { domains }: Props = $props();

	const columns: DataTableColumn<CloudflareDomainCheck>[] = [
		{
			key: 'status',
			label: 'Status',
			sortable: true,
			sortValue: (domain) => (domain.status === 'fail' ? 0 : domain.status === 'warn' ? 1 : 2)
		},
		{ key: 'target', label: 'Target', sortable: true },
		{ key: 'source', label: 'Source', sortable: true },
		{ key: 'httpStatus', label: 'HTTP', sortable: true, numeric: true },
		{ key: 'responseMs', label: 'Response', sortable: true, numeric: true },
		{ key: 'pingAvgMs', label: 'Ping', sortable: true, numeric: true },
		{ key: 'tlsDaysLeft', label: 'TLS', sortable: true, numeric: true }
	];

	const statusLabel = (status: CloudflareDomainCheck['status']) =>
		status === 'ok' ? 'OK' : status === 'warn' ? 'Warning' : 'Failing';
</script>

<DataTable
	rows={domains}
	{columns}
	heading="Monitored domains"
	headingId="domain-table-title"
	countText="{domains.length} domains checked"
	initialSortKey="status"
>
	{#snippet row(domain: CloudflareDomainCheck)}
		<td>
			<span class="status-pill" data-status={domain.status}>{statusLabel(domain.status)}</span>
		</td>
		<td class="domain-name">
			<a href={domain.target}>{domain.label || domain.target}</a>
			{#if domain.error}
				<p>{domain.error}</p>
			{/if}
		</td>
		<td>{domain.source === 'manual' ? `Manual (${domain.provider})` : 'Cloudflare'}</td>
		<td class="numeric">{domain.httpStatus ?? '—'}</td>
		<td class="numeric"
			>{domain.responseMs === null ? '—' : `${domain.responseMs.toFixed(0)} ms`}</td
		>
		<td class="numeric">{domain.pingAvgMs === null ? '—' : `${domain.pingAvgMs.toFixed(1)} ms`}</td>
		<td class="numeric">{domain.tlsDaysLeft === null ? '—' : `${domain.tlsDaysLeft} days`}</td>
	{/snippet}
</DataTable>

<style>
	.status-pill {
		display: inline-block;
		min-width: 64px;
		border: 1px solid var(--color-line);
		padding: 2px 7px;
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-align: center;
		text-transform: uppercase;
	}

	.status-pill[data-status='ok'] {
		border-color: rgba(0, 100, 0, 0.35);
		background: rgba(0, 120, 0, 0.08);
		color: #1f6b2a;
	}

	.status-pill[data-status='warn'] {
		border-color: rgba(150, 90, 0, 0.4);
		background: rgba(190, 120, 0, 0.1);
		color: #7a4f00;
	}

	.status-pill[data-status='fail'] {
		border-color: rgba(150, 0, 0, 0.4);
		background: rgba(190, 0, 0, 0.08);
		color: #8a1f1f;
	}

	.domain-name {
		font-weight: var(--font-weight-bold);
	}

	.domain-name p {
		margin: var(--space-1) 0 0;
		color: #8a1f1f;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-normal);
	}
</style>
