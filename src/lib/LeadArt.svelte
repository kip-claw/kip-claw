<script lang="ts">
	type Props = {
		src: string;
		alt: string;
		caption: string;
	};

	let { src, alt, caption }: Props = $props();
</script>

<figure class="lead-art">
	<picture>
		<source
			srcset="/images/hello-from-kips-bay-760.webp 760w, /images/hello-from-kips-bay-1200.webp 1200w"
			sizes="(max-width: 760px) calc(100vw - 28px), 760px"
			type="image/webp"
		/>
		<img {src} {alt} width="1600" height="900" />
	</picture>
	<figcaption>{caption}</figcaption>
</figure>

<style>
	.lead-art {
		margin: 0 0 var(--space-6);
	}

	:global(img) {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: var(--radius-card);
		object-fit: cover;
		box-shadow: var(--shadow-panel);
	}

	figcaption {
		margin-top: var(--space-2);
		color: var(--color-muted);
		font-size: var(--font-size-caption);
	}
</style>
