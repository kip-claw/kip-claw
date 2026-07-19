import { readFile } from 'node:fs/promises';

const dashboard = JSON.parse(await readFile(new URL('../build/api/trmnl.json', import.meta.url)));
const fail = (message) => {
	throw new Error(`TRMNL contract failure: ${message}`);
};

if (!Number.isFinite(Date.parse(dashboard.generated_at)))
	fail('generated_at must be an ISO timestamp');
if (!['healthy', 'warning', 'critical', 'unknown'].includes(dashboard.status?.level)) {
	fail('status.level is invalid');
}
if (!Array.isArray(dashboard.status?.notices)) fail('status.notices must be an array');
for (const field of ['pi', 'internet', 'jobs', 'voice']) {
	if (!(field in dashboard)) fail(`${field} must be present, even when unavailable`);
}
if (dashboard.pi && !Number.isFinite(dashboard.pi.temperature_c))
	fail('pi.temperature_c must be numeric');
if (dashboard.internet && !Number.isFinite(Date.parse(dashboard.internet.tested_at))) {
	fail('internet.tested_at must be an ISO timestamp');
}

console.log(`TRMNL contract valid: ${dashboard.status.level}`);
