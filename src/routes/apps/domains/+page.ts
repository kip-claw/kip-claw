import { parseCloudflareDomainData } from '$lib/cloudflareDomains';

export const csr = true;

export const load = async ({ fetch }) => {
	const res = await fetch('/data/cloudflareDomains.json');
	let raw: unknown = null;
	if (res.ok) {
		const text = await res.text();
		if (text.trim()) {
			try {
				raw = JSON.parse(text);
			} catch {
				raw = null;
			}
		}
	}
	return { domainData: parseCloudflareDomainData(raw) };
};
