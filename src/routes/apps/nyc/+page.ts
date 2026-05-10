import { parseNycListData } from '$lib/nycList';

export const csr = true;

export const load = async ({ fetch }) => {
	const res = await fetch('/data/nycList.json');
	return { places: parseNycListData(await res.json()) };
};
