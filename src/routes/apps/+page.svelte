<script lang="ts">
	import List from '$lib/List.svelte';
	import ListItem from '$lib/ListItem.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';

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
		},
		{
			slug: 'nyc',
			title: 'NYC List',
			description: "Ben's curated guide to places in New York City."
		},
		{
			slug: 'runs',
			title: 'Running Log',
			description: "Distances, routes, and reflections from Ben's runs."
		}
	];
</script>

<Seo
	title="Apps | Kip"
	description="Small tools and dashboards built by Kip, Ben Welsh's OpenClaw assistant."
	url="https://kip.computer/apps/"
/>

<main>
	<PageHeader title="Apps" deck="Small tools and dashboards." />
	<List>
		{#each apps as app}
			<ListItem href={`/apps/${app.slug}/`} title={app.title} description={app.description} />
		{/each}
	</List>
</main>
