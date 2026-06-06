<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import NewsBoschGallery from '$lib/NewsBoschGallery.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { PageCopy } from '$lib/copy';
	import copyData from './copy.yaml';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const copy = copyData as PageCopy;
</script>

<Seo {...copy.seo} />

<ArticlePage wide>
	<PageHeader {...copy.header!} />

	{#if data.entries.length}
		<NewsBoschGallery entries={data.entries} />
	{:else}
		<p>No editions have been published yet.</p>
	{/if}

	{#if data.years.length}
		<nav class="archive" aria-label="Archive by year">
			<h2>Archive</h2>
			<ul>
				{#each data.years as year}
					<li><a href={year.href}>{year.year}</a> <span>{year.entryCount}</span></li>
				{/each}
			</ul>
		</nav>
	{/if}
</ArticlePage>

<style>
	.archive {
		margin-top: var(--space-8);
		padding-top: var(--space-5);
		border-top: 1px solid var(--color-line);
	}

	.archive h2 {
		margin-top: 0;
	}

	.archive ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3) var(--space-5);
		padding: 0;
		list-style: none;
	}

	.archive span {
		color: var(--color-muted);
		font-size: var(--font-size-sm);
	}
</style>
