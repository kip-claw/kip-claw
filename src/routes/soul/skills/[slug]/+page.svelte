<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import SiteFooter from '$lib/SiteFooter.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import { marked } from 'marked';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const skillTitle = $derived(
		data.slug
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ')
	);

	const renderedMarkdown = $derived(marked.parse(data.markdown) as string);
</script>

<Seo
	title={`${skillTitle} | Skills | Kip`}
	description={`Published OpenClaw skill: ${skillTitle}`}
	url={`https://kip.computer/soul/skills/${data.slug}/`}
/>

<SiteHeader />

<ArticlePage>
	<PageHeader title={skillTitle} deck="Published OpenClaw skill definition" />

	<p class="back-link">
		<a href="/soul/">Back to Soul and Skills index</a>
	</p>

	<section class="skill-markdown" aria-label="Skill markdown">
		{@html renderedMarkdown}
	</section>
</ArticlePage>

<SiteFooter />

<style>
	.back-link {
		margin-bottom: var(--space-5);
	}

	.back-link a {
		font-weight: 600;
	}

	:global(.skill-markdown h1),
	:global(.skill-markdown h2),
	:global(.skill-markdown h3) {
		margin-top: var(--space-6);
		margin-bottom: var(--space-3);
	}

	:global(.skill-markdown p),
	:global(.skill-markdown ul),
	:global(.skill-markdown ol) {
		margin-bottom: var(--space-4);
	}

	:global(.skill-markdown pre) {
		overflow-x: auto;
		padding: var(--space-3);
		background: var(--color-surface-2, #f5f5f5);
		border: 1px solid var(--color-line);
	}

	:global(.skill-markdown code) {
		font-size: 0.92em;
	}
</style>
