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
	
	const skillDescription = $derived(data.metadata?.description || '');
</script>

<Seo
	title={`${skillTitle} | Skills | Kip`}
	description={skillDescription || `Published OpenClaw skill: ${skillTitle}`}
	url={`https://kip.computer/soul/skills/${data.slug}/`}
/>

<SiteHeader />

<ArticlePage>
	<p class="skill-eyebrow">SKILL</p>
	<PageHeader title={skillTitle} deck="Published OpenClaw skill definition" />

	<p class="back-link">
		<a href="/soul/">Back to Soul and Skills index</a>
	</p>

	{#if skillDescription}
		<section class="skill-metadata">
			<p class="skill-description">{skillDescription}</p>
		</section>
	{/if}

	<section class="skill-markdown" aria-label="Skill markdown">
		{@html renderedMarkdown}
	</section>
</ArticlePage>

<SiteFooter />

<style>
	.skill-eyebrow {
		margin: 0 0 var(--space-2) 0;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-secondary, #666);
		font-weight: 700;
	}

	.back-link {
		margin-bottom: var(--space-5);
	}

	.back-link a {
		font-weight: 600;
	}

	.skill-metadata {
		background: var(--color-surface-1, #fafafa);
		border-left: 4px solid var(--color-accent, #0066cc);
		padding: var(--space-3) var(--space-4);
		margin-bottom: var(--space-6);
		border-radius: 2px;
	}

	.skill-description {
		margin: 0;
		font-style: italic;
		color: var(--color-text-secondary, #666);
		line-height: 1.6;
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
