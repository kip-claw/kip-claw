import type { PageLoad } from './$types';
import type { PublishedSkill } from '$lib/skillsRepo';
import publishedSkills from '$lib/publishedSkills.json';

export const prerender = true;

export const csr = true;

export const load: PageLoad = async () => {
	return { skills: publishedSkills as PublishedSkill[], skillsError: '' };
};
