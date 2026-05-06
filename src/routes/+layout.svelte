<script lang="ts">
	import '../styles.css';

	let { children } = $props();
</script>

<svelte:head>
	<meta property="og:site_name" content="Kip" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{@render children()}
