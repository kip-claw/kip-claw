import { parseRunsData } from '$lib/runs';

export const csr = true;

export const load = async ({ fetch }) => {
	const res = await fetch('/data/runs.json');
	return { runs: parseRunsData(await res.json()) };
};
