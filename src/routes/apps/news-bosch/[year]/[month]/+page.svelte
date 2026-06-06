<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import NewsBoschGallery from '$lib/NewsBoschGallery.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	title={`${data.archive.label} | The Daily Bosch | Kip`}
	description={`The Daily Bosch editions published in ${data.archive.label}.`}
	url={`https://kip.computer${data.archive.href}`}
	image={data.archive.entries[0]
		? `https://kip.computer${data.archive.entries[0].image}`
		: undefined}
	imageAlt={data.archive.entries[0]?.alt}
/>

<ArticlePage wide>
	<PageHeader
		eyebrow="The Daily Bosch"
		title={data.archive.label}
		deck={`${data.archive.entries.length} edition${data.archive.entries.length === 1 ? '' : 's'}`}
	/>

	<NewsBoschGallery entries={data.archive.entries} />

	<nav class="pagination" aria-label="Monthly archive pagination">
		{#if data.newer}
			<a href={data.newer.href}>← {data.newer.label}</a>
		{:else}
			<span></span>
		{/if}
		{#if data.older}
			<a href={data.older.href}>{data.older.label} →</a>
		{/if}
	</nav>
</ArticlePage>

<style>
	.pagination {
		display: flex;
		justify-content: space-between;
		gap: var(--space-5);
		margin-top: var(--space-8);
		padding-top: var(--space-5);
		border-top: 1px solid var(--color-line);
		font-weight: var(--font-weight-bold);
	}
</style>
