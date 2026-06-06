import { error } from '@sveltejs/kit';
import { getNewsBoschEntry, newsBoschEntries } from '$lib/newsBosch';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	newsBoschEntries.map((entry) => {
		const [year, month, day] = entry.date.split('-');
		return { year, month, day };
	});

export const load: PageLoad = ({ params }) => {
	const entry = getNewsBoschEntry(params.year, params.month, params.day);
	if (!entry) throw error(404, 'Edition not found');

	const index = newsBoschEntries.findIndex((candidate) => candidate.date === entry.date);
	return {
		entry,
		newer: index > 0 ? newsBoschEntries[index - 1] : null,
		older: index < newsBoschEntries.length - 1 ? newsBoschEntries[index + 1] : null
	};
};
