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
		<p class="eyebrow">
			{#if datetime}
				<time {datetime}>{eyebrow}</time>
			{:else}
				{eyebrow}
			{/if}
		</p>
	{/if}
	<h1>{title}</h1>
	{#if deck}
		<p class="deck">{deck}</p>
	{/if}
	{#if byline}
		<p class="byline">By {byline}</p>
	{/if}
</header>

<style>
	.page-header {
		margin-bottom: var(--space-7);
	}

	.eyebrow {
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

	p.deck {
		max-width: 660px;
        margin: var(--space-1);
		color: var(--color-muted);
		font-size: var(--font-size-xl);
		overflow-wrap: anywhere;
	}

	p.byline {
		margin-top: var(--space-2);
		color: var(--color-muted);
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-bold);
	}
</style>
