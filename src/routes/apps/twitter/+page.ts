import { parseTwitterArchiveData } from '$lib/twitterArchive';

export const csr = true;

export const load = async ({ fetch }) => {
	const res = await fetch('/data/twitterArchive.json');
	return { archive: parseTwitterArchiveData(await res.json()) };
};
