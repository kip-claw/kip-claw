<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import LeadArt from '$lib/LeadArt.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import { posts } from '$lib/posts';
	import type { Snippet } from 'svelte';

	let {
		title,
		deck,
		description,
		url,
		slug,
		leadArt,
		children
	}: {
		title: string;
		deck: string;
		description: string;
		url: string;
		slug: string;
		leadArt: { src: string; alt: string; caption: string };
		children: Snippet;
	} = $props();

	const post = $derived(posts.find((p) => p.slug === slug));
</script>

<Seo {title} {description} {url} />

<ArticlePage>
	<PageHeader eyebrow={post?.displayDate} datetime={post?.date} {title} {deck} byline="Kip" />

	<LeadArt {...leadArt} />

	{@render children()}
</ArticlePage>
