<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import CronHeatmap from '$lib/CronHeatmap.svelte';
	import MemoryChart from '$lib/MemoryChart.svelte';
	import MemorySemanticMapChart from '$lib/MemorySemanticMapChart.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import PiHealthChart from '$lib/PiHealthChart.svelte';
	import Seo from '$lib/Seo.svelte';
	import SpeedChart from '$lib/SpeedChart.svelte';
	import SpeedTestTable from '$lib/SpeedTestTable.svelte';
	import StatGrid from '$lib/StatGrid.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import TranscriptionChart from '$lib/TranscriptionChart.svelte';
	import type { PageCopy } from '$lib/copy';
	import { getLatestSnapshot, buildHeatmap, getCronSummary } from '$lib/cronJobs';
	import type { CronJobSnapshot } from '$lib/cronJobs';
	import { getPiHealthSummary, parsePiHealthData } from '$lib/piHealth';
	import openclawMemory from '$lib/openclawMemory.json';
	import openclawMemoryMap from '$lib/openclawMemoryMap.json';
	import { getLatestMemorySnapshotByAgent, type OpenClawMemorySnapshot } from '$lib/openclawMemory';
	import { emptyMemoryMapSnapshot, type OpenClawMemoryMapSnapshot } from '$lib/openclawMemoryMap';
	import { getSpeedTestsSummary } from '$lib/speedTests';
	import {
		getTranscriptionSummary,
		type TranscriptionDiagnostics
	} from '$lib/transcriptionDiagnostics';
	import openclawConfig from '$lib/openclawConfig.json';
	import openclawJobs from '$lib/openclawJobs.json';
	import piHealthData from '$lib/piHealth.json';
	import transcriptionData from '$lib/transcriptionDiagnostics.json';
	import cronJobNames from '$lib/cronJobNames.json';
	import copyData from './copy.yaml';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const copy = copyData as PageCopy<{
		openClawHeading: string;
		memoryHeading: string;
		cronHeading: string;
		piHeading: string;
		transcriptionHeading: string;
		speedHeading: string;
		labels: {
			version: string;
			model: string;
			memoryModel: string;
			memoryChunks: string;
			memoryRecall: string;
			cronOk: string;
			cronErrored: string;
			cronAvgDuration: string;
			piCpuTemp: string;
			piRam: string;
			piDisk: string;
			piUptime: string;
			transcriptionModel: string;
			transcriptionReliability: string;
			transcriptionUsage: string;
			latestDownload: string;
			averageDownload: string;
			latestUpload: string;
			averageUpload: string;
		};
		charts: {
			download: string;
			upload: string;
			temperature: string;
			transcriptionSpeed: string;
			memoryTrend: string;
			memorySemanticMap: string;
		};
	}>;

	const summary = $derived(getSpeedTestsSummary(data.speedTests));
	const latestConfig = openclawConfig.at(-1);
	const activeJobSet = new Set(cronJobNames as string[]);
	const filteredJobs = (openclawJobs as CronJobSnapshot[]).filter((r) =>
		activeJobSet.has(r.jobName)
	);
	const memoryRows = openclawMemory as OpenClawMemorySnapshot[];
	const memoryMap = (openclawMemoryMap as OpenClawMemoryMapSnapshot) || emptyMemoryMapSnapshot;
	const memoryMainRows = memoryRows.filter((row) => row.agentId === 'main');
	const memoryLatestByAgent = getLatestMemorySnapshotByAgent(memoryRows);
	const memoryMain = memoryLatestByAgent.main;
	const cronLatest = getLatestSnapshot(filteredJobs);
	const cronHeatmap = buildHeatmap(filteredJobs, 30);
	const cronSummary = getCronSummary(cronLatest);
	const piHealth = getPiHealthSummary(parsePiHealthData(piHealthData));
	const piLatest = piHealth.latest;
	const transcription = getTranscriptionSummary(transcriptionData as TranscriptionDiagnostics);
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header!} />

	<h2 class="stats-section">{copy.openClawHeading}</h2>

	<StatGrid label="OpenClaw system status" columns={3}>
		<StatItem label={copy.labels.version} value={latestConfig?.version ?? '—'} />
		<StatItem label={copy.labels.model} value={latestConfig?.primaryModel ?? '—'} />
	</StatGrid>

	<h2 class="stats-section">{copy.piHeading}</h2>

	<StatGrid label="Pi hardware summary">
		<StatItem
			label={copy.labels.piCpuTemp}
			value={piLatest ? piLatest.cpuTempC.toFixed(1) : '—'}
			unit="°C"
		/>
		<StatItem
			label={copy.labels.piRam}
			value={piLatest
				? `${(piLatest.ramUsedMb / 1024).toFixed(1)} / ${(piLatest.ramTotalMb / 1024).toFixed(1)}`
				: '—'}
			unit="GB"
		/>
		<StatItem
			label={copy.labels.piDisk}
			value={piLatest ? `${piLatest.diskUsedGb} / ${piLatest.diskTotalGb}` : '—'}
			unit="GB"
		/>
		<StatItem
			label={copy.labels.piUptime}
			value={piLatest ? piLatest.uptimeDays.toFixed(0) : '—'}
			unit="days"
		/>
	</StatGrid>

	<PiHealthChart rows={piHealth.sorted} title={copy.charts.temperature} chartId="pi-temperature" />

	<h2 class="stats-section">{copy.memoryHeading}</h2>

	<StatGrid label="Memory index summary" columns={4}>
		<StatItem
			label={copy.labels.memoryModel}
			value={memoryMain ? `${memoryMain.provider}/${memoryMain.model}` : '—'}
		/>
		<StatItem label={copy.labels.memoryChunks} value={memoryMain?.indexedChunks ?? '—'} />
		<StatItem label={copy.labels.memoryRecall} value={memoryMain?.recallEntries ?? '—'} />
	</StatGrid>

	<MemorySemanticMapChart
		snapshot={memoryMap}
		title={copy.charts.memorySemanticMap}
		chartId="memory-semantic-map"
	/>

	<MemoryChart rows={memoryMainRows} title={copy.charts.memoryTrend} chartId="memory-trend" />

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

	<h2 class="stats-section">{copy.transcriptionHeading}</h2>

	<StatGrid label="Voice transcription summary" columns={3}>
		<StatItem label={copy.labels.transcriptionModel} value={transcription.model} />
		<StatItem
			label={copy.labels.transcriptionReliability}
			value={transcription.requests.length ? transcription.successRate.toFixed(0) : '—'}
			unit={transcription.requests.length ? '%' : undefined}
		/>
		<StatItem
			label={copy.labels.transcriptionUsage}
			value={transcription.audioMinutes.toFixed(1)}
			unit="minutes"
		/>
	</StatGrid>

	<TranscriptionChart
		rows={transcription.requests}
		title={copy.charts.transcriptionSpeed}
		chartId="transcription-speed"
	/>

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
