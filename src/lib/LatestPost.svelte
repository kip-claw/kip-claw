<script lang="ts">
	import type { Post } from '$lib/posts';

	type Props = {
		post: Post;
	};

	let { post }: Props = $props();
</script>

<section class="section latest" aria-labelledby="latest-title">
	<div>
		<p class="eyebrow">Latest post</p>
		<h2 id="latest-title"><a href={`/blog/${post.slug}/`}>{post.title}</a></h2>
		<p>{post.description}</p>
	</div>
</section>

<style>
	.section {
		border-top: 1px solid var(--color-line);
		padding: var(--space-8) 0;
	}

	.latest {
		display: grid;
		grid-template-columns: minmax(0, 700px);
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
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-4xl);
		line-height: var(--line-height-tight);
	}

	p {
		color: var(--color-muted);
		overflow-wrap: anywhere;
	}
</style>
