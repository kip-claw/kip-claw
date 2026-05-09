<script lang="ts">
	import '../styles.css';
	import SiteFooter from '$lib/SiteFooter.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta property="og:site_name" content="Kip" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<SiteHeader />

{@render children()}

<SiteFooter />
