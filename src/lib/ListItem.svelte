<script lang="ts">
	import Eyebrow from '$lib/Eyebrow.svelte';

	type Props = {
		href: string;
		title: string;
		description?: string;
		eyebrow?: string;
		eyebrowDatetime?: string;
	};

	let { href, title, description, eyebrow, eyebrowDatetime }: Props = $props();
</script>

<li class="list-item">
	{#if eyebrow}
		<Eyebrow>
			{#if eyebrowDatetime}
				<time datetime={eyebrowDatetime}>{eyebrow}</time>
			{:else}
				{eyebrow}
			{/if}
		</Eyebrow>
	{/if}
	<h2 class="title"><a {href}>{title}</a></h2>
	{#if description}
		<div class="description">{description}</div>
	{/if}
</li>

<style lang="scss">
	li.list-item {
		padding: var(--space-5) 0;
		border-top: 1px solid var(--color-line);

		h2.title {
			margin: var(--space-1) 0 0;
			font-size: var(--font-size-2xl);
			line-height: var(--line-height-snug);
		}

		div.description {
			margin: var(--space-1) 0 0;
			color: var(--color-muted);
			overflow-wrap: anywhere;
		}
	}
</style>
