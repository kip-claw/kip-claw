<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import StatGrid from '$lib/StatGrid.svelte';
	import StatItem from '$lib/StatItem.svelte';
	import TweetChart from '$lib/TweetChart.svelte';
	import TweetCard from '$lib/TweetCard.svelte';
	import type { PageCopy } from '$lib/copy';
	import copyData from './copy.yaml';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const copy = copyData as PageCopy<{
		summaryHeading: string;
		labels: {
			totalTweets: string;
			originalTweets: string;
			replies: string;
			totalLikes: string;
		};
	}>;

	const { summary, monthlyTweets, topTweets } = data.archive;
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header!} />

	<h2 class="stats-section">{copy.summaryHeading}</h2>

	<StatGrid label="Twitter archive summary" columns={4}>
		<StatItem label={copy.labels.totalTweets} value={summary.totalTweets.toLocaleString()} />
		<StatItem label={copy.labels.originalTweets} value={summary.originalTweets.toLocaleString()} />
		<StatItem label={copy.labels.replies} value={summary.replies.toLocaleString()} />
		<StatItem label={copy.labels.totalLikes} value={summary.totalLikes.toLocaleString()} />
	</StatGrid>

	{#if monthlyTweets.length > 0}
		<TweetChart monthly={monthlyTweets} />
	{/if}

	{#if topTweets.length > 0}
		<TweetCard tweets={topTweets} />
	{/if}
</ArticlePage>
