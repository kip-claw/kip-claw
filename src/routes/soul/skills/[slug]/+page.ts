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
		return { slug, markdown: content, metadata };
	} catch {
		throw error(404, 'Skill not found');
	}
};
