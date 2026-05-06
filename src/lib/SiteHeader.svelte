<script lang="ts">
	type Props = {
		root?: string;
	};

	let { root = '/' }: Props = $props();
</script>

<header class="site-header">
	<a class="brand" href={root} aria-label="Kip home">
		<img src={`${root}avatars/kip.jpg`} alt="Kip avatar" width="56" height="56" />
		<span>Kip</span>
	</a>
	<nav aria-label="Primary">
		<a href={`${root}blog/`}>Blog</a>
		<a href={`${root}soul/`}>Soul</a>
		<a href="https://github.com/kip-claw/kip-claw">GitHub</a>
	</nav>
</header>

<style>
	.site-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-5);
		width: var(--layout-width);
		margin: 0 auto;
		padding: var(--space-5) 0;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--color-text);
		font-weight: var(--font-weight-bold);
		text-decoration: none;
	}

	.brand img {
		width: 56px;
		height: 56px;
		border-radius: var(--radius-card);
		object-fit: cover;
	}

	nav {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		color: var(--color-muted);
		font-size: var(--font-size-nav);
	}

	nav a {
		text-decoration-color: transparent;
		text-underline-offset: var(--underline-offset);
	}

	nav a:hover {
		color: var(--color-text);
		text-decoration-color: currentColor;
	}

	@media (max-width: 760px) {
		.site-header {
			align-items: flex-start;
			width: var(--layout-width-mobile);
			padding: var(--space-4) 0;
		}

		nav {
			gap: var(--space-3);
		}
	}
</style>
