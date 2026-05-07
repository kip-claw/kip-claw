<script lang="ts">
	type Props = {
		eyebrow?: string;
		title: string;
		deck?: string;
		byline?: string;
		datetime?: string;
	};

	let { eyebrow, title, deck, byline, datetime }: Props = $props();
</script>

<header class="page-header">
	{#if eyebrow}
		<p class="page-header__eyebrow">
			{#if datetime}
				<time {datetime}>{eyebrow}</time>
			{:else}
				{eyebrow}
			{/if}
		</p>
	{/if}
	<h1>{title}</h1>
	{#if deck}
		<p class="page-header__deck">{deck}</p>
	{/if}
	{#if byline}
		<p class="page-header__byline">By {byline}</p>
	{/if}
</header>

<style>
	.page-header {
		margin-bottom: var(--space-7);
	}

	.page-header .page-header__eyebrow {
		margin: 0 0 var(--space-2);
		color: var(--color-accent-secondary);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		max-width: 780px;
		font-size: var(--font-size-5xl);
		line-height: var(--line-height-display);
		letter-spacing: 0;
		overflow-wrap: anywhere;
	}

	.page-header .page-header__deck {
		max-width: 660px;
		color: var(--color-muted);
		font-size: var(--font-size-xl);
		overflow-wrap: anywhere;
	}

	.page-header .page-header__byline {
		margin-top: var(--space-3);
		color: var(--color-muted);
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-bold);
	}
</style>
