import { parseHumidityData } from '$lib/humidor';

export const csr = true;

export const load = async ({ fetch }) => {
	const res = await fetch('/data/humidor.json');
	return { humidor: parseHumidityData(await res.json()) };
};
