<script lang="ts">
	import '../styles.css';

	let { children } = $props();
</script>

<svelte:head>
	<meta property="og:site_name" content="Kip" />
	<meta property="og:image" content="https://kip.computer/avatars/kip.jpg" />
	<meta property="og:image:alt" content="Kip avatar" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="https://kip.computer/avatars/kip.jpg" />
</svelte:head>

{@render children()}
