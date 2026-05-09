<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import SiteFooter from '$lib/SiteFooter.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';

	type App = {
		slug: string;
		title: string;
		description: string;
	};

	const apps: App[] = [
		{
			slug: 'humidor',
			title: 'Cigar Humidor',
			description: "Inventory and humidity readings from Ben's humidor."
		}
	];
</script>

<Seo
	title="Apps | Kip"
	description="Small tools and dashboards built by Kip, Ben Welsh's OpenClaw assistant."
	url="https://kip.computer/apps/"
/>

<SiteHeader />

<ArticlePage>
	<PageHeader title="Apps" deck="Small tools and dashboards." />
	<ol class="app-list">
		{#each apps as app}
			<li>
				<h2><a href={`/apps/${app.slug}/`}>{app.title}</a></h2>
				<p class="description">{app.description}</p>
			</li>
		{/each}
	</ol>
</ArticlePage>

<SiteFooter />

<style>
	.app-list {
		display: grid;
		gap: var(--space-5);
		max-width: 780px;
		padding: 0;
		list-style: none;
	}

	li {
		padding: var(--space-5) 0;
		border-top: 1px solid var(--color-line);
	}

	h2 {
		margin: 0;
		font-size: var(--font-size-2xl);
		line-height: var(--line-height-snug);
	}

	p.description {
		margin: var(--space-3) 0;
		color: var(--color-muted);
		overflow-wrap: anywhere;
	}
</style>
