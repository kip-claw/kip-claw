import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { fetchPublishedSkillMarkdown, parseFrontmatter } from '$lib/skillsRepo';
import type { PublishedSkill } from '$lib/skillsRepo';
import publishedSkills from '$lib/publishedSkills.json';

export const prerender = true;

export const entries: EntryGenerator = async () => {
	return (publishedSkills as PublishedSkill[]).map((skill) => ({ slug: skill.slug }));
};

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug;

	try {
		const markdown = await fetchPublishedSkillMarkdown(slug);
		const { metadata, content } = parseFrontmatter(markdown);
		// Skills commonly link to companion files such as AGENTS.md. Those
		// relative links belong to the source repository, not to this site's
		// /soul/skills/:slug/ route. Resolve them externally so SvelteKit's
		// prerender crawler does not mistake them for local pages.
		const sourceMarkdown = `https://github.com/kip-claw/skills/blob/main/${slug}/`;
		const resolvedContent = content.replace(
			/\]\((?!https?:\/\/|mailto:|#|\/)([^)#]+)(#[^)]*)?\)/g,
			(_match, path: string, hash = '') => `](${sourceMarkdown}${path}${hash})`
		);
		return { slug, markdown: resolvedContent, metadata };
	} catch {
		throw error(404, 'Skill not found');
	}
};
