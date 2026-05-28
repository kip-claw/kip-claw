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

	// Show a subset of date labels to avoid crowding
	const labelInterval = Math.max(1, Math.ceil(dates.length / 7));
</script>

<section class="heatmap-section" aria-labelledby="cron-heatmap-heading">
	<h3 id="cron-heatmap-heading">Last {dates.length} days</h3>
	<div class="legend" aria-label="Heatmap legend">
		<span><i class="dot-legend" data-status="ok"></i> OK</span>
		<span><i class="dot-legend" data-status="error"></i> Error</span>
		<span><i class="dot-legend" data-status="idle"></i> Idle</span>
	</div>
	<div class="heatmap-container">
		<div class="heatmap-grid" style={`--day-count: ${dates.length}`}>
			<div class="heatmap-header">
				<div class="job-name-col"></div>
				<div class="dates-row" aria-hidden="true">
					{#each dates as date, i}
						<span class="date-label" class:visible={i % labelInterval === 0}>
							{formatDate(date)}
						</span>
					{/each}
				</div>
			</div>
			{#each rows as row}
				<div class="heatmap-row">
					<div class="job-name" title={row.jobName}>{row.jobName}</div>
					<div class="cells-row">
						{#each row.cells as cell}
							<span
								class="cell"
								data-status={cell.status}
								title="{row.jobName} on {cell.date}: {cell.status}"
							></span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.heatmap-section {
		margin-bottom: var(--space-6);
	}

	h3 {
		margin: 0 0 var(--space-3);
	}

	.heatmap-container {
		width: 100%;
		overflow-x: auto;
	}

	.heatmap-grid {
		--job-col: 180px;
		--cell-size: 18px;
		--row-gap: 3px;
		min-width: 600px;
	}

	.heatmap-header,
	.heatmap-row {
		display: grid;
		grid-template-columns: var(--job-col) minmax(0, 1fr);
		align-items: center;
		gap: 0;
	}

	.heatmap-row {
		border-top: 1px solid var(--color-line);
		padding: var(--row-gap) 0;
	}

	.heatmap-header {
		margin-bottom: 2px;
		align-items: end;
	}

	.dates-row,
	.cells-row {
		display: grid;
		grid-template-columns: repeat(var(--day-count), minmax(0, 1fr));
		gap: 1px;
	}

	.date-label {
		text-align: center;
		font-size: 10px;
		color: var(--color-muted);
		visibility: hidden;
		min-width: 0;
	}

	.date-label.visible {
		visibility: visible;
	}

	.job-name-col {
		min-height: 12px;
	}

	.job-name {
		font-size: var(--font-size-xs);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding-right: var(--space-3);
		line-height: 1.4;
	}

	.cell {
		height: var(--cell-size);
		border-radius: 2px;
		min-width: 0;
	}

	.cell[data-status='ok'] {
		background: #28a745;
	}

	.cell[data-status='error'] {
		background: var(--color-accent);
	}

	.cell[data-status='idle'] {
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
		.heatmap-grid {
			--cell-size: 10px;
			min-width: 450px;
		}
	}
</style>
