<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import CronHeatmap from '$lib/CronHeatmap.svelte';
	import CronJobTable from '$lib/CronJobTable.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import SpeedChart from '$lib/SpeedChart.svelte';
	import SpeedTestTable from '$lib/SpeedTestTable.svelte';
	import StatGrid from '$lib/StatGrid.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import type { PageCopy } from '$lib/copy';
	import { getLatestSnapshot, buildHeatmap, getCronSummary } from '$lib/cronJobs';
	import type { CronJobSnapshot } from '$lib/cronJobs';
	import { getSpeedTestsSummary } from '$lib/speedTests';
	import openclawConfig from '$lib/openclawConfig.json';
	import openclawJobs from '$lib/openclawJobs.json';
	import copyData from './copy.yaml';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const copy = copyData as PageCopy<{
		openClawHeading: string;
		cronHeading: string;
		speedHeading: string;
		labels: {
			version: string;
			model: string;
			skills: string;
			cronOk: string;
			cronErrored: string;
			cronAvgDuration: string;
			latestDownload: string;
			averageDownload: string;
			latestUpload: string;
			averageUpload: string;
		};
		charts: { download: string; upload: string };
	}>;

	const summary = $derived(getSpeedTestsSummary(data.speedTests));
	const latestConfig = openclawConfig.at(-1);
	const cronLatest = getLatestSnapshot(openclawJobs as CronJobSnapshot[]);
	const cronHeatmap = buildHeatmap(openclawJobs as CronJobSnapshot[]);
	const cronSummary = getCronSummary(cronLatest);
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header!} />

	<h2 class="stats-section">{copy.openClawHeading}</h2>

	<StatGrid label="OpenClaw system status" columns={3}>
		<StatItem label={copy.labels.version} value={latestConfig?.version ?? '—'} />
		<StatItem label={copy.labels.model} value={latestConfig?.primaryModel ?? '—'} />
		<StatItem label={copy.labels.skills} value={latestConfig?.skillsCount ?? '—'} />
	</StatGrid>

	<h2 class="stats-section">{copy.cronHeading}</h2>

	<StatGrid label="Cron job summary" columns={3}>
		<StatItem label={copy.labels.cronOk} value={cronSummary.ok} />
		<StatItem label={copy.labels.cronErrored} value={cronSummary.errored} />
		<StatItem
			label={copy.labels.cronAvgDuration}
			value={`${cronSummary.avgDuration.toFixed(0)}s`}
		/>
	</StatGrid>

	<CronHeatmap rows={cronHeatmap.rows} dates={cronHeatmap.dates} />
	<CronJobTable jobs={cronLatest} />

	<h2 class="stats-section">{copy.speedHeading}</h2>

	<StatGrid label="Speed test summary">
		<StatItem
			label={copy.labels.latestDownload}
			value={summary.latest?.downloadMbps.toFixed(0) ?? '—'}
			unit="Mbps"
		/>
		<StatItem
			label={copy.labels.averageDownload}
			value={summary.averageDownload.toFixed(0)}
			unit="Mbps"
		/>
		<StatItem
			label={copy.labels.latestUpload}
			value={summary.latest?.uploadMbps.toFixed(0) ?? '—'}
			unit="Mbps"
		/>
		<StatItem
			label={copy.labels.averageUpload}
			value={summary.averageUpload.toFixed(0)}
			unit="Mbps"
		/>
	</StatGrid>

	<div class="charts-grid">
		<SpeedChart
			tests={data.speedTests}
			metric="download"
			title={copy.charts.download}
			chartId="download-speed"
		/>
		<SpeedChart
			tests={data.speedTests}
			metric="upload"
			title={copy.charts.upload}
			chartId="upload-speed"
		/>
	</div>

	<SpeedTestTable tests={data.speedTests} />
</ArticlePage>

<style>
	.charts-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-7);
		margin-bottom: var(--space-5);
	}

	@media (max-width: 760px) {
		.charts-grid {
			grid-template-columns: 1fr;
			gap: var(--space-8);
		}
	}
</style>
