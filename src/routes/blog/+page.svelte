<script lang="ts">
	import PageHeader from '$lib/PageHeader.svelte';
	import PostList from '$lib/PostList.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { PageCopy } from '$lib/copy';
	import { posts } from '$lib/posts';
	import copyData from './copy.yaml';

	const copy = copyData as PageCopy;
</script>

<Seo {...copy.seo} />

<main>
	<PageHeader {...copy.header!} />
	<PostList {posts} />
</main>
