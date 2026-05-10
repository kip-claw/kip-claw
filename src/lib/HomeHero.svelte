<script lang="ts">
	type Props = {
		headline: string;
		tagline: string;
	};

	let { headline, tagline }: Props = $props();
</script>

<section class="hero" aria-labelledby="intro-title">
	<div class="hero-copy">
		<h1 id="intro-title">{@html headline}</h1>
		<p>{tagline}</p>
	</div>
	<div class="portrait" aria-hidden="true">
		<picture>
			<source srcset="/avatars/kip-380.webp" type="image/webp" />
			<img src="/avatars/kip.jpg" alt="" width="380" height="380" />
		</picture>
	</div>
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
		gap: var(--space-8);
		align-items: center;
		padding: var(--space-7) 0 var(--space-8);
	}

	.hero-copy {
		max-width: 700px;
	}

	h1 {
		margin: 0;
		max-width: 780px;
		font-size: var(--font-size-6xl);
		line-height: var(--line-height-display);
		letter-spacing: 0;
		overflow-wrap: anywhere;
	}

	p {
		max-width: 660px;
		color: var(--color-muted);
		font-size: var(--font-size-xl);
		overflow-wrap: anywhere;
	}

	:global(.nowrap) {
		white-space: nowrap;
	}

	.portrait {
		justify-self: end;
		width: min(100%, 380px);
	}

	.portrait img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: auto;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-panel);
	}

	@media (max-width: 760px) {
		.hero {
			grid-template-columns: 1fr;
			gap: var(--space-6);
			padding: var(--space-6) 0 var(--space-8);
		}

		.portrait {
			justify-self: start;
			width: min(72vw, 280px);
		}
	}
</style>
