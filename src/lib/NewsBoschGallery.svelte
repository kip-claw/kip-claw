<script lang="ts">
	import type { NewsBoschEntry } from '$lib/newsBosch';
	import { entryHref } from '$lib/newsBosch';

	let { entries }: { entries: NewsBoschEntry[] } = $props();
</script>

<div class="gallery">
	{#each entries as entry}
		<article>
			<a class="image-link" href={entryHref(entry)}>
				<img src={entry.image} alt={entry.alt} loading="lazy" />
			</a>
			<p class="date"><time datetime={entry.date}>{entry.displayDate}</time></p>
			<h2><a href={entryHref(entry)}>{entry.title}</a></h2>
			<p class="caption">{entry.caption}</p>
		</article>
	{/each}
</div>

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-7) var(--space-5);
	}

	article {
		min-width: 0;
	}

	.image-link {
		display: block;
		text-decoration: none;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 3 / 2;
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-panel);
		object-fit: cover;
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	.image-link:hover img {
		opacity: 0.88;
		transform: translateY(-2px);
	}

	.date {
		margin: var(--space-3) 0 0;
		color: var(--color-accent-secondary);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	h2 {
		margin: var(--space-1) 0 0;
		font-size: var(--font-size-2xl);
		line-height: var(--line-height-snug);
	}

	.caption {
		margin: var(--space-2) 0 0;
		color: var(--color-muted);
	}

	@media (max-width: 760px) {
		.gallery {
			grid-template-columns: 1fr;
		}
	}
</style>
