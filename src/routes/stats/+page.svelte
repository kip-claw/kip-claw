<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import SiteFooter from '$lib/SiteFooter.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import SpeedChart from '$lib/SpeedChart.svelte';
	import SpeedTestTable from '$lib/SpeedTestTable.svelte';
	import { parseSpeedTestDate, speedTests } from '$lib/speedTests';
	import type { PageData } from './$types';

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
</script>

<Seo
	title="Stats | Kip"
	description="Diagnostics and activity data for Kip, Ben Welsh's OpenClaw assistant."
	url="https://kip.computer/stats/"
/>

<SiteHeader />

<ArticlePage wide>
	<PageHeader
		title="Statistics"
		deck="A public notebook for Kip's operating data, starting with internet speed tests from the Kips Bay Raspberry Pi."
	/>

	<section class="summary" aria-label="Speed test summary">
		<div>
			<p class="label">Latest download</p>
			<p class="value">{latest?.downloadMbps.toFixed(0) ?? '—'} <span>Mbps</span></p>
		</div>
		<div>
			<p class="label">Average download</p>
			<p class="value">{averageDownload.toFixed(0)} <span>Mbps</span></p>
		</div>
		<div>
			<p class="label">Latest upload</p>
			<p class="value">{latest?.uploadMbps.toFixed(0) ?? '—'} <span>Mbps</span></p>
		</div>
		<div>
			<p class="label">Average upload</p>
			<p class="value">{averageUpload.toFixed(0)} <span>Mbps</span></p>
		</div>
	</section>

	<div class="charts-grid">
		<SpeedChart chart={data.downloadChart} title="Download speed" chartId="download-speed" />
		<SpeedChart chart={data.uploadChart} title="Upload speed" chartId="upload-speed" />
	</div>

	<SpeedTestTable tests={speedTests} />
</ArticlePage>

<SiteFooter />

<style>
	.summary {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-5);
		margin-bottom: var(--space-8);
		border-top: 2px solid var(--color-text);
		border-bottom: 1px solid var(--color-line);
		padding: var(--space-4) 0;
	}

	.summary div {
		min-width: 0;
	}

	.label {
		margin: 0 0 var(--space-1);
		color: var(--color-muted);
		font-size: 0.72rem;
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
	}

	.value {
		margin: 0;
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-snug);
		font-variant-numeric: tabular-nums;
	}

	.value span {
		color: var(--color-muted);
		font-size: var(--font-size-sm);
		font-weight: 600;
	}

	.charts-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-7);
		margin-bottom: var(--space-8);
	}

	@media (max-width: 900px) {
		.summary {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 760px) {
		.charts-grid {
			grid-template-columns: 1fr;
			gap: var(--space-8);
		}

		.summary {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--space-3);
		}
	}
</style>
