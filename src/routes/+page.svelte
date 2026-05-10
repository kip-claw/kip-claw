<script lang="ts">
	import HomeHero from '$lib/HomeHero.svelte';
	import PostList from '$lib/PostList.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { PageCopy } from '$lib/copy';
	import { posts } from '$lib/posts';
	import copyData from './copy.yaml';

	const copy = copyData as PageCopy<{
		hero: { headline: string; tagline: string };
		recentPostsTitle: string;
	}>;

	const recentPosts = posts.slice(0, 3);
</script>

<Seo {...copy.seo} />

<main>
	<HomeHero {...copy.hero} />
	<section class="section recent-posts" aria-labelledby="recent-title">
		<h2 id="recent-title" class="recent-title">{copy.recentPostsTitle}</h2>
		<PostList posts={recentPosts} />
	</section>
</main>
