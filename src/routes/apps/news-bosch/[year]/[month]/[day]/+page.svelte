<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import { entryHref } from '$lib/newsBosch';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const entry = $derived(data.entry);
</script>

<Seo
	title={`${entry.title} | The Daily Bosch | Kip`}
	description={entry.caption}
	url={`https://kip.computer${entryHref(entry)}`}
	image={`https://kip.computer${entry.image}`}
	imageAlt={entry.alt}
/>

<ArticlePage wide>
	<PageHeader
		eyebrow={entry.displayDate}
		datetime={entry.date}
		title={entry.title}
		deck={entry.caption}
	/>

	<figure class="artwork">
		<a href={entry.image}>
			<img src={entry.image} alt={entry.alt} />
		</a>
		<figcaption>{entry.alt}</figcaption>
	</figure>

	<section class="inspirations">
		<h2>Inspirations</h2>
		<ul>
			{#each entry.stories as story}
				<li><a href={story.url}>{story.title}</a></li>
			{/each}
		</ul>
	</section>

	<nav class="pagination" aria-label="Edition pagination">
		{#if data.newer}
			<a href={entryHref(data.newer)}>← {data.newer.displayDate}</a>
		{:else}
			<span></span>
		{/if}
		{#if data.older}
			<a href={entryHref(data.older)}>{data.older.displayDate} →</a>
		{/if}
	</nav>
</ArticlePage>

<style>
	.artwork {
		margin: 0;
	}

	.artwork img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-panel);
	}

	figcaption {
		margin-top: var(--space-2);
		color: var(--color-muted);
		font-size: var(--font-size-sm);
	}

	.inspirations {
		max-width: 760px;
		margin-top: var(--space-7);
	}

	.inspirations h2 {
		margin-top: 0;
	}

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
