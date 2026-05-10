<script lang="ts">
	import type { Run } from './runs';
	import { parseRunDate } from './runs';

	type Props = {
		runs: Run[];
	};

	type SortKey = keyof Run;

	let { runs }: Props = $props();
	let sortKey = $state<SortKey>('date');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	const headers: { key: SortKey; label: string }[] = [
		{ key: 'date', label: 'Date' },
		{ key: 'distance', label: 'Distance' },
		{ key: 'route', label: 'Route' }
	];

	const sortedRuns = $derived(
		[...runs].sort((a, b) => {
			const direction = sortDirection === 'asc' ? 1 : -1;
			if (sortKey === 'date') {
				return (+parseRunDate(a.date) - +parseRunDate(b.date)) * direction;
			}
			return String(a[sortKey]).localeCompare(String(b[sortKey])) * direction;
		})
	);

	const formatDate = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});

	const sortBy = (key: SortKey) => {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			return;
		}

		sortKey = key;
		sortDirection = key === 'date' ? 'desc' : 'asc';
	};
</script>

<section class="table-section" aria-labelledby="runs-table-title">
	<div class="table-heading">
		<h3 id="runs-table-title">Activity</h3>
		<p>{runs.length} runs logged</p>
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
				{#each sortedRuns as run}
					<tr>
						<td class="no-wrap">{formatDate.format(parseRunDate(run.date))}</td>
						<td class="no-wrap">{run.distance}</td>
						<td>{run.route}</td>
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
		min-width: 620px;
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

	.no-wrap {
		white-space: nowrap;
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
