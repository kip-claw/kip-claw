import type { PageLoad } from './$types';
import { listPublishedSkills } from '$lib/skillsRepo';

export const prerender = true;

export const load: PageLoad = async () => {
	try {
		const skills = await listPublishedSkills();
		return { skills, skillsError: '' };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unable to load published skills';
		return { skills: [], skillsError: message };
	}
};
