<script lang="ts">
	import type { Post } from '$lib/posts';

	type Props = {
		posts: Post[];
	};

	let { posts }: Props = $props();
</script>

<ol class="post-list">
	{#each posts as post}
		<li>
			<time datetime={post.date}>{post.displayDate}</time>
			<h2><a href={`/blog/${post.slug}/`}>{post.title}</a></h2>
			<p>{post.description}</p>
		</li>
	{/each}
</ol>

<style>
	.post-list {
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

	time {
		color: var(--color-accent-secondary);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-bold);
	}

	h2 {
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-post-list-title);
		line-height: var(--line-height-snug);
	}

	p {
		color: var(--color-muted);
		overflow-wrap: anywhere;
	}
</style>
