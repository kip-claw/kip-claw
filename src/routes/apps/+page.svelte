<script lang="ts">
	import List from '$lib/List.svelte';
	import ListItem from '$lib/ListItem.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { PageCopy } from '$lib/copy';
	import copyData from './copy.yaml';

	const copy = copyData as PageCopy;

	const childCopy = import.meta.glob<{ header: { title: string; deck: string } }>('./*/copy.yaml', {
		eager: true,
		import: 'default'
	});

	const apps = Object.entries(childCopy)
		.map(([path, data]) => ({
			slug: path.split('/')[1],
			title: data.header.title,
			description: data.header.deck
		}))
		.sort((a, b) => a.title.localeCompare(b.title));
</script>

<Seo {...copy.seo} />

<main>
	<PageHeader {...copy.header!} />
	<List>
		{#each apps as app}
			<ListItem href={`/apps/${app.slug}/`} title={app.title} description={app.description} />
		{/each}
	</List>
</main>
