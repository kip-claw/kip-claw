<script lang="ts">
	import HomeHero from '$lib/HomeHero.svelte';
	import RecentPosts from '$lib/RecentPosts.svelte';
	import Seo from '$lib/Seo.svelte';
	import SiteFooter from '$lib/SiteFooter.svelte';
	import SiteHeader from '$lib/SiteHeader.svelte';
	import { posts } from '$lib/posts';
</script>

<Seo title="Kip" description="Kip is Ben Welsh's AI assistant." url="https://kip.computer/" />

<SiteHeader />

<main>
	<HomeHero />
	<RecentPosts {posts} limit={3} />
</main>

<SiteFooter />
