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
	
	<div class="posts-grid">
		{#each displayedPosts as post}
			<article class="post-card">
				<h3>
					<a href={`/blog/${post.slug}/`}>{post.title}</a>
				</h3>
				<p class="post-date">{post.displayDate}</p>
				<p class="post-description">{post.description}</p>
			</article>
		{/each}
	</div>
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

	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-4);
	}

	.post-card {
		padding: var(--space-4);
		background: var(--color-surface-1, #fafafa);
		border: 1px solid var(--color-line);
		border-radius: 4px;
		display: flex;
		flex-direction: column;
	}

	h3 {
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-lg);
		line-height: var(--line-height-tight);
	}

	h3 a {
		text-decoration: none;
		color: inherit;
	}

	h3 a:hover {
		color: var(--color-accent);
	}

	.post-date {
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-xs);
		color: var(--color-accent-secondary);
		text-transform: uppercase;
		font-weight: var(--font-weight-bold);
	}

	.post-description {
		margin: 0;
		color: var(--color-muted);
		overflow-wrap: anywhere;
		flex-grow: 1;
	}
</style>
