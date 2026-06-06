import { error } from '@sveltejs/kit';
import { getNewsBoschMonths } from '$lib/newsBosch';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	getNewsBoschMonths().map(({ year, month }) => ({ year, month }));

export const load: PageLoad = ({ params }) => {
	const months = getNewsBoschMonths();
	const index = months.findIndex(
		(month) => month.year === params.year && month.month === params.month
	);
	if (index === -1) throw error(404, 'Archive month not found');

	return {
		archive: months[index],
		newer: index > 0 ? months[index - 1] : null,
		older: index < months.length - 1 ? months[index + 1] : null
	};
};
