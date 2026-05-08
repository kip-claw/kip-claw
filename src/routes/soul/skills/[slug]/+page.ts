import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { fetchPublishedSkillMarkdown, listPublishedSkills } from '$lib/skillsRepo';

export const prerender = true;

export const entries: EntryGenerator = async () => {
	try {
		const skills = await listPublishedSkills();
		return skills.map((skill) => ({ slug: skill.slug }));
	} catch {
		return [];
	}
};

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug;

	try {
		const markdown = await fetchPublishedSkillMarkdown(slug);
		return { slug, markdown };
	} catch {
		throw error(404, 'Skill not found');
	}
};
