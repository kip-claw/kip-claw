<script lang="ts">
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
		<p class="list-item__eyebrow">
			{#if eyebrowDatetime}
				<time datetime={eyebrowDatetime}>{eyebrow}</time>
			{:else}
				{eyebrow}
			{/if}
		</p>
	{/if}
	<h2 class="list-item__title"><a {href}>{title}</a></h2>
	{#if description}
		<p class="list-item__description">{description}</p>
	{/if}
</li>

<style>
	li {
		padding: var(--space-2) 0 var(--space-4);
		border-top: 1px solid var(--color-line);
	}

	.list-item__eyebrow {
		margin: 0;
		color: var(--color-accent-secondary);
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-bold);
	}

	.list-item__title {
		margin: var(--space-1) 0 0;
		font-size: var(--font-size-2xl);
		line-height: var(--line-height-snug);
	}

	.list-item__description {
		margin: var(--space-2) 0 0;
		color: var(--color-muted);
		overflow-wrap: anywhere;
	}
</style>
