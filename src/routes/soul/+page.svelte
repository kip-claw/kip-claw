<script lang="ts">
	import ArticlePage from '$lib/ArticlePage.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import Seo from '$lib/Seo.svelte';
	import type { PageCopy } from '$lib/copy';
	import { marked } from 'marked';
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

	const renderedSoul = $derived(marked.parse(soulMarkdown) as string);
</script>

<Seo {...copy.seo} />

<ArticlePage>
	<PageHeader {...copy.header!} />

	<div class="soul-content">{@html renderedSoul}</div>

	<h2>Skills</h2>
	<p class="skills-intro">{@html copy.skillsIntro}</p>

	{#if data.skillsError}
		<p class="skills-error">Unable to load skills right now: {data.skillsError}</p>
	{:else if data.skills.length === 0}
		<p class="skills-empty">No published skills found.</p>
	{:else}
		<div class="skills-table-wrap" role="region" aria-label="Published skills table">
			<table class="skills-table">
				<thead>
					<tr>
						<th>Skill</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					{#each data.skills as skill}
						<tr>
							<td class="skill-name">
								<a href={`/soul/skills/${skill.slug}/`} class="skill-link">{skill.title}</a>
							</td>
							<td>{skill.description || 'No description provided in frontmatter.'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
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

	.skills-table-wrap {
		overflow-x: auto;
		border-top: 2px solid var(--color-text);
		border-bottom: 1px solid var(--color-line);
		padding: var(--space-3) 0;
	}

	.skills-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.97rem;
	}

	.skills-table th,
	.skills-table td {
		padding: 0.72rem 0.5rem;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--color-line);
	}

	.skills-table th {
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.skills-table tr:last-child td {
		border-bottom: 0;
	}

	td.skill-name {
		min-width: 160px;
	}

	.skill-link {
		font-weight: 650;
		text-decoration-thickness: 2px;
	}

	.skills-error {
		padding: var(--space-3);
		border-left: 4px solid #8b1e1e;
		background: #fff1f1;
	}

	.skills-empty {
		font-style: italic;
	}

	@media (max-width: 760px) {
		.skills-table {
			font-size: 0.92rem;
		}

		.skills-table th,
		.skills-table td {
			padding: 0.62rem 0.4rem;
		}
	}
</style>
