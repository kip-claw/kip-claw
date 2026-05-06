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
		<a href="https://github.com/kip-claw/kip-claw">GitHub</a>
	</nav>
</header>
