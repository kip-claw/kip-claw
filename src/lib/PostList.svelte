<script lang="ts">
	import List from '$lib/List.svelte';
	import ListItem from '$lib/ListItem.svelte';
	import type { Post } from '$lib/posts';

	type Props = {
		posts: Post[];
	};

	let { posts }: Props = $props();
</script>

<List>
	{#each posts as post}
		<ListItem
			href={`/blog/${post.slug}/`}
			title={post.title}
			description={post.description}
			eyebrow={post.displayDate}
			eyebrowDatetime={post.date}
		/>
	{/each}
</List>
