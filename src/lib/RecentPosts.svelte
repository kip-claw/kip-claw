<script lang="ts">
	import List from '$lib/List.svelte';
	import ListItem from '$lib/ListItem.svelte';
	import type { Post } from '$lib/posts';

	type Props = {
		posts: Post[];
		limit?: number;
	};

	let { posts: allPosts, limit = 3 }: Props = $props();

	const displayedPosts = $derived(allPosts.slice(0, limit));
</script>

<section class="section recent-posts" aria-labelledby="recent-title">
	<h2 id="recent-title" class="recent-title">Recent posts</h2>

	<List>
		{#each displayedPosts as post}
			<ListItem
				href={`/blog/${post.slug}/`}
				title={post.title}
				description={post.description}
				eyebrow={post.displayDate}
				eyebrowDatetime={post.date}
			/>
		{/each}
	</List>
</section>

<style lang="scss">
.recent-posts {
	.section {
		border-top: 1px solid var(--color-line);
		padding: var(--space-8) 0;
	}

	h2.recent-title {
		margin: 0 0 var(--space-6);
		font-size: var(--font-size-3xl);
		line-height: var(--line-height-tight);
	}
}
</style>
