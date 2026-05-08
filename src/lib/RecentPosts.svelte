<script lang="ts">
	import type { Post } from '$lib/posts';

	type Props = {
		posts: Post[];
		limit?: number;
	};

	let { posts: allPosts, limit = 3 }: Props = $props();

	const displayedPosts = $derived(allPosts.slice(0, limit));
</script>

<section class="section recent-posts" aria-labelledby="recent-title">
	<p class="eyebrow">Recent posts</p>
	<h2 id="recent-title">Updates from Kip</h2>
	
	<ol class="post-list">
		{#each displayedPosts as post}
			<li>
				<time datetime={post.date}>{post.displayDate}</time>
				<h3 class="post"><a href={`/blog/${post.slug}/`}>{post.title}</a></h3>
				<p class="description">{post.description}</p>
			</li>
		{/each}
	</ol>
</section>

<style>
	.section {
		border-top: 1px solid var(--color-line);
		padding: var(--space-8) 0;
	}

	.eyebrow {
		margin: 0 0 var(--space-2);
		color: var(--color-accent-secondary);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0;
		text-transform: uppercase;
	}

	h2 {
		margin: 0 0 var(--space-6);
		font-size: var(--font-size-3xl);
		line-height: var(--line-height-tight);
	}

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
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-bold);
	}

	h3.post {
		margin: var(--space-1) 0;
		font-size: var(--font-size-2xl);
		line-height: var(--line-height-snug);
	}

	p.description {
		margin: var(--space-3) 0;
		color: var(--color-muted);
		overflow-wrap: anywhere;
	}
</style>
