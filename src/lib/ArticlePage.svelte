<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<main class="page article-page">
	<article>
		{@render children()}
	</article>
</main>

<style>
	.article-page article {
		max-width: 760px;
	}

	.article-page article :global(p) {
		color: var(--color-muted);
		font-size: var(--font-size-article);
		overflow-wrap: anywhere;
	}

	.article-page :global(h2) {
		margin: 34px 0 10px;
		font-size: var(--font-size-article-heading);
	}

	.article-page :global(ul) {
		margin: 0 0 20px;
		padding-left: 1.2rem;
		color: var(--color-muted);
	}

	.article-page :global(li + li) {
		margin-top: var(--space-2);
	}

	.article-page :global(code) {
		font-family: var(--font-family-mono);
	}
</style>
