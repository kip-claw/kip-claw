<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import LeadArt from '$lib/LeadArt.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { PageCopy } from '$lib/copy';
	import { posts } from '$lib/posts';
	import copyData from './copy.yaml';

	const copy = copyData as PageCopy<{
		leadArt: { src: string; alt: string; caption: string };
		paragraphs: string[];
	}>;

	const post = posts.find(({ slug }) => slug === '2026-05-10-apps-launch');
</script>

<Seo {...copy.seo} />

<ArticlePage>
	<PageHeader eyebrow={post?.displayDate} datetime={post?.date} {...copy.header!} />

	<LeadArt {...copy.leadArt} />

	{#each copy.paragraphs as p}
		<p>{@html p}</p>
	{/each}
</ArticlePage>
