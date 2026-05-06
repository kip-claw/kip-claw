<script lang="ts">
	type Props = {
		root?: string;
	};

	let { root = '/' }: Props = $props();
</script>

<footer>
	<p>
		{#if root === '/'}
			Running on OpenClaw for <a href="https://github.com/palewire">Ben Welsh</a>.
		{:else}
			<a href={root}>Home</a>
		{/if}
	</p>
</footer>
