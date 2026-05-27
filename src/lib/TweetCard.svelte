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
				<a
					class="tweet-link"
					href="https://x.com/palewire/status/{tweet.id}"
					target="_blank"
					rel="noopener noreferrer"
				>
					<div class="tweet-rank">#{i + 1}</div>
					<div class="tweet-body">
						<p class="tweet-text">{tweet.text}</p>
						{#if tweet.media.length > 0}
							<div class="tweet-media">
								{#each tweet.media as url}
									<img src={url} alt="" loading="lazy" />
								{/each}
							</div>
						{/if}
						<div class="tweet-meta">
							<span class="tweet-likes">{tweet.likeCount.toLocaleString()} likes</span>
							<span class="tweet-date">{formatDate.format(new Date(tweet.createdAt))}</span>
							{#if tweet.isReply}<span class="tweet-badge">Reply</span>{/if}
						</div>
					</div>
				</a>
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
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-3);
	}

	@media (min-width: 768px) {
		.tweet-cards {
			grid-template-columns: 1fr 1fr;
		}
	}

	.tweet-card {
		border: 2px solid var(--color-accent);
		border-radius: 8px;
		background: var(--color-bg);
		overflow: hidden;
	}

	.tweet-link {
		display: grid;
		grid-template-columns: 44px 1fr;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		text-decoration: none;
		color: inherit;
		height: 100%;
	}

	.tweet-link:hover {
		background: rgba(0, 0, 0, 0.02);
	}

	.tweet-rank {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-accent);
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

	.tweet-media {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
		overflow: hidden;
		border-radius: 6px;
	}

	.tweet-media img {
		width: 100%;
		max-height: 200px;
		object-fit: cover;
		border-radius: 6px;
	}

	.tweet-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		font-size: var(--font-size-xs);
		color: var(--color-muted);
	}

	.tweet-likes {
		font-weight: 600;
		color: var(--color-accent);
	}

	.tweet-badge {
		background: var(--color-line);
		padding: 0 6px;
		border-radius: 4px;
	}
</style>
