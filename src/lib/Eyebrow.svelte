<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<span class="eyebrow">{@render children()}</span>

<style>
	span.eyebrow {
		margin: 0;
		color: var(--color-accent-secondary);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0;
		text-transform: uppercase;
	}
</style>
