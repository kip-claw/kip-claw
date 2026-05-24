import { parseCloudflareDomainData } from '$lib/cloudflareDomains';

export const csr = true;

export const load = async ({ fetch }) => {
	const res = await fetch('/data/cloudflareDomains.json');
	return { domainData: parseCloudflareDomainData(await res.json()) };
};
