<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import List from '$lib/List.svelte';
	import ListItem from '$lib/ListItem.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	title={`${data.archive.year} | The Daily Bosch | Kip`}
	description={`The Daily Bosch monthly archives for ${data.archive.year}.`}
	url={`https://kip.computer${data.archive.href}`}
	image={data.archive.months[0]?.entries[0]
		? `https://kip.computer${data.archive.months[0].entries[0].image}`
		: undefined}
	imageAlt={data.archive.months[0]?.entries[0]?.alt}
/>

<ArticlePage>
	<PageHeader
		eyebrow="The Daily Bosch"
		title={data.archive.year}
		deck={`${data.archive.entryCount} edition${data.archive.entryCount === 1 ? '' : 's'}`}
	/>

	<List>
		{#each data.archive.months as month}
			<ListItem
				href={month.href}
				title={month.label}
				description={`${month.entries.length} edition${month.entries.length === 1 ? '' : 's'}`}
			/>
		{/each}
	</List>

	<nav class="pagination" aria-label="Yearly archive pagination">
		{#if data.newer}
			<a href={data.newer.href}>← {data.newer.year}</a>
		{:else}
			<span></span>
		{/if}
		{#if data.older}
			<a href={data.older.href}>{data.older.year} →</a>
		{/if}
	</nav>
</ArticlePage>

<style>
	.pagination {
		display: flex;
		justify-content: space-between;
		gap: var(--space-5);
		margin-top: var(--space-8);
		margin-bottom: var(--space-8);
		padding-top: var(--space-5);
		font-weight: var(--font-weight-bold);
	}
</style>
