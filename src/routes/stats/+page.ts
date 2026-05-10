import { parseSpeedTestsData } from '$lib/speedTests';

export const csr = true;

export const load = async ({ fetch }) => {
	const res = await fetch('/data/speedTests.json');
	return { speedTests: parseSpeedTestsData(await res.json()) };
};
