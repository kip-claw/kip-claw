<script lang="ts">
	import type { SpeedTest } from './speedTests';
	import { parseSpeedTestDate } from './speedTests';

	type Props = {
		tests: SpeedTest[];
	};

	type SortKey = keyof SpeedTest;

	let { tests }: Props = $props();
	let sortKey = $state<SortKey>('timestamp');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	const headers: { key: SortKey; label: string; numeric?: boolean }[] = [
		{ key: 'timestamp', label: 'Time' },
		{ key: 'downloadMbps', label: 'Download', numeric: true },
		{ key: 'uploadMbps', label: 'Upload', numeric: true },
		{ key: 'pingMs', label: 'Ping', numeric: true },
		{ key: 'server', label: 'Server' },
		{ key: 'provider', label: 'Provider' }
	];

	const sortedTests = $derived(
		[...tests].sort((a, b) => {
			const direction = sortDirection === 'asc' ? 1 : -1;
			const aValue = sortKey === 'timestamp' ? +parseSpeedTestDate(a.timestamp) : a[sortKey];
			const bValue = sortKey === 'timestamp' ? +parseSpeedTestDate(b.timestamp) : b[sortKey];

			if (typeof aValue === 'number' && typeof bValue === 'number') {
				return (aValue - bValue) * direction;
			}

			return String(aValue).localeCompare(String(bValue)) * direction;
		})
	);

	const formatDateTime = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});

	const sortBy = (key: SortKey) => {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			return;
		}

		sortKey = key;
		sortDirection = key === 'timestamp' ? 'desc' : 'asc';
	};
</script>

<section class="table-section" aria-labelledby="speed-table-title">
	<div class="table-heading">
		<h3 id="speed-table-title">Speed test log</h3>
		<p>{tests.length} tests logged</p>
	</div>
	<div class="table-frame">
		<table>
			<thead>
				<tr>
					{#each headers as header}
						<th
							class:numeric={header.numeric}
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
				{#each sortedTests as test}
					<tr>
						<td>{formatDateTime.format(parseSpeedTestDate(test.timestamp))}</td>
						<td class="numeric">{test.downloadMbps.toFixed(2)}</td>
						<td class="numeric">{test.uploadMbps.toFixed(2)}</td>
						<td class="numeric">{test.pingMs.toFixed(1)}</td>
						<td>{test.server}</td>
						<td>{test.provider}</td>
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

	.numeric {
		text-align: right;
		font-variant-numeric: tabular-nums;
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
