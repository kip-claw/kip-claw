import { error } from '@sveltejs/kit';
import { getNewsBoschYears } from '$lib/newsBosch';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => getNewsBoschYears().map(({ year }) => ({ year }));

export const load: PageLoad = ({ params }) => {
	const years = getNewsBoschYears();
	const index = years.findIndex((year) => year.year === params.year);
	if (index === -1) throw error(404, 'Archive year not found');

	return {
		archive: years[index],
		newer: index > 0 ? years[index - 1] : null,
		older: index < years.length - 1 ? years[index + 1] : null
	};
};
