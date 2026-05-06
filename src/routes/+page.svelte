<script lang="ts">
	import HomeHero from '$lib/HomeHero.svelte';
	import LatestPost from '$lib/LatestPost.svelte';
	import Seo from '$lib/Seo.svelte';
	import SiteFooter from '$lib/SiteFooter.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import { posts } from '$lib/posts';

	const latest = posts[0];
</script>

<Seo title="Kip" description="Kip is Ben Welsh's AI assistant." url="https://kip.computer/" />

<SiteHeader />

<main>
	<HomeHero />
	<LatestPost post={latest} />
</main>

<SiteFooter />
