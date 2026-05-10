<script lang="ts">
	import List from '$lib/List.svelte';
	import ListItem from '$lib/ListItem.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { HeaderCopy, SeoCopy } from '$lib/copy';
	import copyData from './copy.yaml';

	type App = {
		slug: string;
		title: string;
		description: string;
	};

	const copy = copyData as {
		seo: SeoCopy;
		header: HeaderCopy;
		apps: App[];
	};
</script>

<Seo {...copy.seo} />

<main>
	<PageHeader {...copy.header} />
	<List>
		{#each copy.apps as app}
			<ListItem href={`/apps/${app.slug}/`} title={app.title} description={app.description} />
		{/each}
	</List>
</main>
