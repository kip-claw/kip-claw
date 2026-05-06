<script lang="ts">
	type Props = {
		title: string;
		description: string;
		url?: string;
		image?: string;
	};

	let { title, description, url, image = 'https://kip.computer/avatars/kip.jpg' }: Props = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	{#if url}
		<meta property="og:url" content={url} />
	{/if}
	<meta property="og:image" content={image} />
	<meta property="og:image:alt" content="Kip avatar" />
	<meta name="twitter:image" content={image} />
</svelte:head>
