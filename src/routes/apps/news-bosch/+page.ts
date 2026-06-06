import { getNewsBoschYears, newsBoschEntries } from '$lib/newsBosch';

export const prerender = true;

export const load = () => {
	return {
		entries: newsBoschEntries.slice(0, 12),
		years: getNewsBoschYears()
	};
};
