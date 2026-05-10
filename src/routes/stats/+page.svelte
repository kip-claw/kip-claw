<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import SpeedChart from '$lib/SpeedChart.svelte';
	import SpeedTestTable from '$lib/SpeedTestTable.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import type { HeaderCopy, SeoCopy } from '$lib/copy';
	import { parseSpeedTestDate, speedTests } from '$lib/speedTests';
	import openclawConfig from '$lib/openclawConfig.json';
	import copyData from './copy.yaml';
	import type { PageData } from './$types';

	const copy = copyData as {
		seo: SeoCopy;
		header: HeaderCopy;
		openClawHeading: string;
		speedHeading: string;
		labels: {
			version: string;
			model: string;
			agent: string;
			latestDownload: string;
			averageDownload: string;
			latestUpload: string;
			averageUpload: string;
		};
		charts: { download: string; upload: string };
	};

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const sortedTests = [...speedTests].sort(
		(a, b) => +parseSpeedTestDate(a.timestamp) - +parseSpeedTestDate(b.timestamp)
	);
	const latest = sortedTests.at(-1);
	const averageDownload =
		speedTests.reduce((total, test) => total + test.downloadMbps, 0) / speedTests.length;
	const averageUpload =
		speedTests.reduce((total, test) => total + test.uploadMbps, 0) / speedTests.length;

	const latestConfig = openclawConfig.at(-1);
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header} />

	<h2 class="stats-section">{copy.openClawHeading}</h2>

	<section class="system-status" aria-label="OpenClaw system status">
		<StatItem label={copy.labels.version} value={latestConfig?.version ?? '—'} />
		<StatItem label={copy.labels.model} value={latestConfig?.primaryModel ?? '—'} />
		<StatItem label={copy.labels.agent} value={latestConfig?.agentRuntime ?? '—'} />
	</section>

	<h2 class="stats-section">{copy.speedHeading}</h2>

	<section class="summary" aria-label="Speed test summary">
		<StatItem label={copy.labels.latestDownload} value={latest?.downloadMbps.toFixed(0) ?? '—'} unit="Mbps" />
		<StatItem label={copy.labels.averageDownload} value={averageDownload.toFixed(0)} unit="Mbps" />
		<StatItem label={copy.labels.latestUpload} value={latest?.uploadMbps.toFixed(0) ?? '—'} unit="Mbps" />
		<StatItem label={copy.labels.averageUpload} value={averageUpload.toFixed(0)} unit="Mbps" />
	</section>

	<div class="charts-grid">
		<SpeedChart chart={data.downloadChart} title={copy.charts.download} chartId="download-speed" />
		<SpeedChart chart={data.uploadChart} title={copy.charts.upload} chartId="upload-speed" />
	</div>

	<SpeedTestTable tests={speedTests} />
</ArticlePage>

<style>
	.system-status {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-5);
		margin-bottom: var(--space-6);
		border-top: 2px solid var(--color-text);
		border-bottom: 1px solid var(--color-line);
		padding: var(--space-4) 0;
	}

	.summary {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-5);
		margin-bottom: var(--space-6);
		border-top: 2px solid var(--color-text);
		border-bottom: 1px solid var(--color-line);
		padding: var(--space-4) 0;
	}

	h2.stats-section {
		font-size: var(--font-size-3xl);
	}

	.charts-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-7);
		margin-bottom: var(--space-5);
	}

	@media (max-width: 900px) {
		.system-status {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.summary {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 760px) {
		.charts-grid {
			grid-template-columns: 1fr;
			gap: var(--space-8);
		}

		.system-status {
			grid-template-columns: 1fr;
		}

		.summary {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--space-3);
		}
	}
</style>
