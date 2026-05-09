<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<ol class="item-list">
	{@render children()}
</ol>

<style>
	.item-list {
		display: grid;
		max-width: 780px;
		padding: 0;
		list-style: none;
	}
</style>
