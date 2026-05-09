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

<li>
	{#if eyebrow}
		<Eyebrow>
			{#if eyebrowDatetime}
				<time datetime={eyebrowDatetime}>{eyebrow}</time>
			{:else}
				{eyebrow}
			{/if}
		</Eyebrow>
	{/if}
	<h2 class="list-item__title"><a {href}>{title}</a></h2>
	{#if description}
		<p class="list-item__description">{description}</p>
	{/if}
</li>

<style>
	li {
		padding: var(--space-3) 0;
		border-top: 1px solid var(--color-line);
	}

	.list-item__title {
		margin: 0;
		font-size: var(--font-size-2xl);
		line-height: var(--line-height-snug);
	}

	.list-item__description {
		margin: var(--space-2) 0 0;
		color: var(--color-muted);
		overflow-wrap: anywhere;
	}
</style>
