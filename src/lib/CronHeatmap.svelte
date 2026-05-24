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
	<div class="heatmap-grid">
		<div class="heatmap-header">
			<div class="job-name-col"></div>
			<div class="dates-row">
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
</section>

<style>
	.heatmap-section {
		margin-bottom: var(--space-6);
	}

	h3 {
		margin: 0 0 var(--space-3);
	}

	.heatmap-grid {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.heatmap-header {
		display: flex;
		align-items: flex-end;
		margin-bottom: 2px;
	}

	.dates-row {
		display: flex;
		flex: 1;
		gap: 1px;
	}

	.date-label {
		flex: 1;
		text-align: center;
		font-size: 10px;
		color: var(--color-muted);
		visibility: hidden;
	}

	.date-label.visible {
		visibility: visible;
	}

	.job-name-col {
		width: 180px;
		min-width: 180px;
		flex-shrink: 0;
	}

	.heatmap-row {
		display: flex;
		align-items: center;
		gap: 0;
	}

	.job-name {
		width: 180px;
		min-width: 180px;
		flex-shrink: 0;
		font-size: var(--font-size-xs);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding-right: var(--space-2);
	}

	.cells-row {
		display: flex;
		flex: 1;
		gap: 1px;
	}

	.cell {
		flex: 1;
		height: 14px;
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
		.job-name-col {
			width: 120px;
			min-width: 120px;
		}

		.job-name {
			width: 120px;
			min-width: 120px;
		}
	}
</style>
