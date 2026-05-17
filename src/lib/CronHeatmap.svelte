<script lang="ts">
	import type { CronHeatmapRow } from './cronJobs';

	type Props = {
		rows: CronHeatmapRow[];
		dates: string[];
	};

	let { rows, dates }: Props = $props();

	const formatDate = (d: string) => {
		const [, month, day] = d.split('-');
		return `${parseInt(month)}/${parseInt(day)}`;
	};
</script>

<section class="heatmap-section" aria-labelledby="cron-heatmap-heading">
	<h3 id="cron-heatmap-heading">Last 7 days</h3>
	<div class="legend" aria-label="Heatmap legend">
		<span><i class="dot-legend" data-status="ok"></i> OK</span>
		<span><i class="dot-legend" data-status="error"></i> Error</span>
		<span><i class="dot-legend" data-status="idle"></i> Idle</span>
	</div>
	<div class="heatmap-scroll">
		<table class="heatmap" role="grid" aria-label="Cron job status over time">
			<thead>
				<tr>
					<th class="job-name-col"></th>
					{#each dates as date}
						<th class="date-col"><span>{formatDate(date)}</span></th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as row}
					<tr>
						<td class="job-name">{row.jobName}</td>
						{#each row.cells as cell}
							<td class="cell" data-status={cell.status}>
								<span class="dot" title="{row.jobName} on {cell.date}: {cell.status}"></span>
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	.heatmap-section {
		margin-bottom: var(--space-6);
	}

	h3 {
		margin: 0 0 var(--space-3);
	}

	.heatmap-scroll {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.heatmap {
		border-collapse: collapse;
		width: 100%;
		font-size: var(--font-size-xs);
	}

	.heatmap thead th {
		font-weight: normal;
		color: var(--color-muted);
		padding: 0 0 var(--space-1);
		text-align: center;
		white-space: nowrap;
	}

	.job-name-col {
		width: 180px;
		min-width: 180px;
	}

	.date-col span {
		display: inline-block;
		transform: rotate(-45deg);
		transform-origin: center;
		font-size: 10px;
	}

	.job-name {
		font-size: var(--font-size-xs);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 180px;
		padding-right: var(--space-2);
		vertical-align: middle;
	}

	.cell {
		text-align: center;
		padding: 2px;
		vertical-align: middle;
	}

	.dot {
		display: inline-block;
		width: 14px;
		height: 14px;
		border-radius: 3px;
	}

	.cell[data-status='ok'] .dot {
		background: #28a745;
	}

	.cell[data-status='error'] .dot {
		background: var(--color-accent);
	}

	.cell[data-status='idle'] .dot {
		background: var(--color-line);
	}

	.legend {
		display: flex;
		gap: var(--space-4);
		margin-top: 0;
		margin-bottom: var(--space-2);
		font-size: var(--font-size-xs);
		color: var(--color-muted);
	}

	.legend span {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.dot-legend {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 2px;
	}

	.dot-legend[data-status='ok'] {
		background: #28a745;
	}

	.dot-legend[data-status='error'] {
		background: var(--color-accent);
	}

	.dot-legend[data-status='idle'] {
		background: var(--color-line);
	}

	@media (max-width: 600px) {
		.job-name-col {
			width: 120px;
			min-width: 120px;
		}

		.job-name {
			max-width: 120px;
		}
	}
</style>
