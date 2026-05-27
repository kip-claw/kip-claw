<script lang="ts">
	import type { TopTweet } from './twitterArchive';

	type Props = {
		tweets: TopTweet[];
	};

	let { tweets }: Props = $props();

	const formatDate = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
</script>

<section class="top-tweets" aria-labelledby="top-tweets-heading">
	<h3 id="top-tweets-heading">Most popular tweets</h3>
	<ol class="tweet-cards">
		{#each tweets as tweet, i}
			<li class="tweet-card">
				<div class="tweet-rank">#{i + 1}</div>
				<div class="tweet-body">
					<p class="tweet-text">{tweet.text}</p>
					<div class="tweet-meta">
						<span class="tweet-likes">{tweet.likeCount.toLocaleString()} likes</span>
						<span class="tweet-date">{formatDate.format(new Date(tweet.createdAt))}</span>
						{#if tweet.isReply}<span class="tweet-reply">Reply</span>{/if}
					</div>
				</div>
			</li>
		{/each}
	</ol>
</section>

<style>
	.top-tweets {
		margin-top: var(--space-6);
	}

	h3 {
		margin: 0 0 var(--space-4);
	}

	.tweet-cards {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.tweet-card {
		display: grid;
		grid-template-columns: 40px 1fr;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-line);
		border-radius: 8px;
		background: var(--color-bg);
	}

	.tweet-rank {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-muted);
		align-self: start;
		padding-top: 2px;
	}

	.tweet-text {
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-sm);
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.tweet-meta {
		display: flex;
		gap: var(--space-3);
		font-size: var(--font-size-xs);
		color: var(--color-muted);
	}

	.tweet-likes {
		font-weight: 600;
		color: var(--color-accent);
	}

	.tweet-reply {
		background: var(--color-line);
		padding: 0 6px;
		border-radius: 4px;
	}
</style>
