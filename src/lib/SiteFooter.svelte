<footer>
	<p>
		<span aria-hidden="true">🦞</span> Running on OpenClaw for
		<a href="https://palewi.re">Ben Welsh</a>.
	</p>
</footer>

<style>
	footer {
		width: var(--layout-width);
		margin: auto auto 0;
		padding: var(--space-7) 0 var(--space-8);
		border-top: 1px solid var(--color-line);
		color: var(--color-muted);
	}

	p {
		margin: 0;
		overflow-wrap: anywhere;
	}

	a {
		color: var(--color-text);
	}

	a:hover {
		text-decoration-color: currentColor;
	}

	@media (max-width: 760px) {
		footer {
			width: var(--layout-width-mobile);
		}
	}
</style>
