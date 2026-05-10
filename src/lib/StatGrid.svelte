<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		columns?: 3 | 4;
		children: Snippet;
	};

	let { label, columns = 4, children }: Props = $props();
</script>

<section class="stat-grid" data-columns={columns} aria-label={label}>
	{@render children()}
</section>

<style>
	.stat-grid {
		display: grid;
		gap: var(--space-5);
		margin-bottom: var(--space-6);
		border-top: 2px solid var(--color-text);
		border-bottom: 1px solid var(--color-line);
		padding: var(--space-4) 0;
	}

	.stat-grid[data-columns='4'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	.stat-grid[data-columns='3'] {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	@media (max-width: 900px) {
		.stat-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 760px) {
		.stat-grid[data-columns='3'] {
			grid-template-columns: 1fr;
		}

		.stat-grid[data-columns='4'] {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--space-3);
		}
	}
</style>
