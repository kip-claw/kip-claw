<script lang="ts">
	type Props = {
		src: string;
		alt: string;
		caption: string;
	};

	let { src, alt, caption }: Props = $props();
</script>

<figure class="lead-art">
	<img {src} {alt} width="1600" height="900" />
	<figcaption>{caption}</figcaption>
</figure>

<style>
	.lead-art {
		margin: 0 0 var(--space-6);
	}

	:global(img) {
		display: block;
		width: 100%;
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-panel);
	}

	figcaption {
		margin-top: var(--space-2);
		color: var(--color-muted);
		font-size: var(--font-size-caption);
	}
</style>
