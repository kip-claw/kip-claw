<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, wide = false }: { children: Snippet; wide?: boolean } = $props();
</script>

<main class="page article-page" class:article-page--wide={wide}>
	<article>
		{@render children()}
	</article>
</main>

<style>
	.article-page article {
		max-width: 760px;
	}

	.article-page--wide article {
		max-width: none;
	}

	.article-page article :global(p) {
		color: var(--color-muted);
		font-size: var(--font-size-lg);
		overflow-wrap: anywhere;
	}

	.article-page :global(h2) {
		margin: 34px 0 10px;
		font-size: var(--font-size-3xl);
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
