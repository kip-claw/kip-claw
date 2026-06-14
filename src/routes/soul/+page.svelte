<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import SetupDiagram from '$lib/SetupDiagram.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { PageCopy } from '$lib/copy';
	import { Marked } from 'marked';
	import soulMarkdown from './soul.md?raw';
	import copyData from './copy.yaml';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const copy = copyData as PageCopy<{
		skillsIntro: string;
	}>;

	// Demote the soul markdown's headings by one level so its top "Identity"
	// heading is an <h2> that sits beneath the page title, matching the
	// Architecture and Skills section headings.
	const soulMarked = new Marked({
		renderer: {
			heading({ tokens, depth }) {
				const level = Math.min(depth + 1, 6);
				return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
			}
		}
	});

	const renderedSoul = $derived(soulMarked.parse(soulMarkdown) as string);

	// Titles and tags come from each skill's frontmatter (synced into
	// publishedSkills.json), so the taxonomy lives with the source skill rather
	// than the front end.
	const taggedSkills = $derived(
		data.skills.map((skill) => ({
			...skill,
			tag: skill.tag || 'Other'
		}))
	);

	const tags = $derived(
		[...new Set(taggedSkills.map((s) => s.tag))].sort((a, b) => a.localeCompare(b))
	);

	let query = $state('');
	let selectedTag = $state('all');

	const filteredSkills = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return taggedSkills.filter((skill) => {
			const matchesTag = selectedTag === 'all' || skill.tag === selectedTag;
			const matchesQuery =
				q === '' ||
				skill.title.toLowerCase().includes(q) ||
				skill.description.toLowerCase().includes(q) ||
				skill.tag.toLowerCase().includes(q);
			return matchesTag && matchesQuery;
		});
	});
</script>

<Seo {...copy.seo} />

<ArticlePage>
	<PageHeader {...copy.header!} />

	<div class="soul-content">{@html renderedSoul}</div>

	<h2>Architecture</h2>
	<SetupDiagram />

	<h2>Skills</h2>
	<p class="skills-intro">{@html copy.skillsIntro}</p>

	{#if data.skillsError}
		<p class="skills-error">Unable to load skills right now: {data.skillsError}</p>
	{:else if data.skills.length === 0}
		<p class="skills-empty">No published skills found.</p>
	{:else}
		<div class="skills-section">
			<div class="skills-controls">
				<label class="skills-search">
					<span class="visually-hidden">Search skills</span>
					<input
						type="search"
						placeholder="Search skills…"
						bind:value={query}
						aria-label="Search skills"
					/>
				</label>
				<label class="skills-filter">
					<span class="visually-hidden">Filter by tag</span>
					<select bind:value={selectedTag} aria-label="Filter skills by tag">
						<option value="all">All tags</option>
						{#each tags as tag}
							<option value={tag}>{tag}</option>
						{/each}
					</select>
				</label>
			</div>

			{#if filteredSkills.length === 0}
				<p class="skills-empty">No skills match your filters.</p>
			{:else}
				<ul class="skills-grid">
					{#each filteredSkills as skill (skill.slug)}
						<li class="skill-card">
							<a href={`/soul/skills/${skill.slug}/`} class="skill-link">{skill.title}</a>
							<p class="skill-card-desc">
								{skill.description || 'No description provided in frontmatter.'}
							</p>
							<span class="skill-tag">{skill.tag}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</ArticlePage>

<style>
	.soul-content {
		margin-bottom: var(--space-8);
	}

	.skills-intro {
		margin-bottom: var(--space-4);
	}

	/* Break the skills section out of the reading column to the full content
	   width on desktop, matching the architecture diagram above. */
	.skills-section {
		width: 100%;
		margin-bottom: var(--space-8);
	}

	@media (min-width: 820px) {
		.skills-section {
			width: min(var(--layout-max-width), calc(100vw - var(--layout-gutter)));
		}
	}

	.skills-controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.skills-search {
		flex: 1 1 240px;
		max-width: 360px;
	}

	.skills-filter {
		flex: 0 1 200px;
	}

	.skills-search input,
	.skills-filter select {
		box-sizing: border-box;
		width: 100%;
		height: 2.75rem;
		padding: 0 0.75rem;
		font: inherit;
		line-height: 1.4;
		color: var(--color-text);
		background: var(--color-background);
		border: 1px solid var(--color-line);
		border-radius: 8px;
	}

	.skills-search input:focus,
	.skills-filter select:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
		border-color: var(--color-accent);
	}

	.skills-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-3);
		margin: 0;
		list-style: none;
	}

	/* Override the global article list styles (.article-page ul / li + li) that
	   would otherwise indent the grid and push every card after the first down. */
	.skills-section ul.skills-grid {
		padding: 0;
	}

	.skills-section .skill-card {
		margin-top: 0;
	}

	@media (min-width: 560px) {
		.skills-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 900px) {
		.skills-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.skill-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		height: 100%;
		gap: var(--space-2);
		padding: var(--space-4);
		border: 1px solid var(--color-line);
		border-radius: 12px;
		background: #fff;
	}

	.skill-link {
		font-weight: 650;
		font-size: var(--font-size-lg);
		color: var(--color-text);
		text-decoration-thickness: 2px;
	}

	.skill-card-desc {
		margin: 0;
		flex: 1 0 auto;
		color: var(--color-muted);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.skill-tag {
		margin-top: var(--space-4);
		padding: 0.15rem 0.55rem;
		font-size: 0.72rem;
		font-weight: 650;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, #fff);
		border: 1px solid color-mix(in srgb, var(--color-accent) 30%, var(--color-line));
		border-radius: 999px;
		white-space: nowrap;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.skills-error {
		padding: var(--space-3);
		border-left: 4px solid #8b1e1e;
		background: #fff1f1;
	}

	.skills-empty {
		font-style: italic;
	}
</style>
