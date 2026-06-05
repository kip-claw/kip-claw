export type DomainCheckStatus = 'ok' | 'warn' | 'fail';

export type CloudflareDomainCheck = {
	timestamp: string;
	domain: string;
	target: string;
	label: string;
	source: string;
	provider: string;
	zoneStatus: string;
	paused: boolean;
	plan: string;
	dnsOk: boolean;
	ips: string[];
	pingOk: boolean;
	pingAvgMs: number | null;
	httpsOk: boolean;
	httpStatus: number | null;
	responseMs: number | null;
	tlsDaysLeft: number | null;
	finalUrl: string;
	remoteIp: string;
	error: string;
	status: DomainCheckStatus;
};

export type CloudflareDomainSummary = {
	total: number;
	ok: number;
	warn: number;
	fail: number;
};

export type CloudflareDomainData = {
	generatedAt: string;
	summary: CloudflareDomainSummary;
	domains: CloudflareDomainCheck[];
	history: CloudflareDomainCheck[];
};

const isStatus = (value: unknown): value is DomainCheckStatus =>
	value === 'ok' || value === 'warn' || value === 'fail';

const toNumberOrNull = (value: unknown): number | null =>
	typeof value === 'number' && Number.isFinite(value) ? value : null;

const parseCheck = (value: unknown): CloudflareDomainCheck | null => {
	if (!value || typeof value !== 'object') return null;
	const candidate = value as Record<string, unknown>;
	if (
		typeof candidate.timestamp !== 'string' ||
		typeof candidate.domain !== 'string' ||
		typeof candidate.zoneStatus !== 'string' ||
		typeof candidate.paused !== 'boolean' ||
		typeof candidate.plan !== 'string' ||
		typeof candidate.dnsOk !== 'boolean' ||
		!Array.isArray(candidate.ips) ||
		typeof candidate.pingOk !== 'boolean' ||
		typeof candidate.httpsOk !== 'boolean' ||
		typeof candidate.finalUrl !== 'string' ||
		typeof candidate.remoteIp !== 'string' ||
		typeof candidate.error !== 'string' ||
		!isStatus(candidate.status)
	) {
		return null;
	}

	return {
		timestamp: candidate.timestamp,
		domain: candidate.domain,
		target:
			typeof candidate.target === 'string' && candidate.target
				? candidate.target
				: `https://${candidate.domain}/`,
		label:
			typeof candidate.label === 'string' && candidate.label
				? candidate.label
				: typeof candidate.target === 'string' && candidate.target
					? candidate.target
					: candidate.domain,
		source:
			typeof candidate.source === 'string' && candidate.source ? candidate.source : 'cloudflare',
		provider:
			typeof candidate.provider === 'string' && candidate.provider
				? candidate.provider
				: 'cloudflare',
		zoneStatus: candidate.zoneStatus,
		paused: candidate.paused,
		plan: candidate.plan,
		dnsOk: candidate.dnsOk,
		ips: candidate.ips.filter((ip): ip is string => typeof ip === 'string'),
		pingOk: candidate.pingOk,
		pingAvgMs: toNumberOrNull(candidate.pingAvgMs),
		httpsOk: candidate.httpsOk,
		httpStatus: toNumberOrNull(candidate.httpStatus),
		responseMs: toNumberOrNull(candidate.responseMs),
		tlsDaysLeft: toNumberOrNull(candidate.tlsDaysLeft),
		finalUrl: candidate.finalUrl,
		remoteIp: candidate.remoteIp,
		error: candidate.error,
		status: candidate.status
	};
};

const fallbackSummary: CloudflareDomainSummary = {
	total: 0,
	ok: 0,
	warn: 0,
	fail: 0
};

export const parseCloudflareDomainData = (raw: unknown): CloudflareDomainData => {
	const data = (raw ?? {}) as Partial<CloudflareDomainData>;
	const domains = Array.isArray(data.domains)
		? data.domains.map(parseCheck).filter((row): row is CloudflareDomainCheck => !!row)
		: [];
	const history = Array.isArray(data.history)
		? data.history.map(parseCheck).filter((row): row is CloudflareDomainCheck => !!row)
		: domains;

	return {
		generatedAt: typeof data.generatedAt === 'string' ? data.generatedAt : '',
		summary: {
			total: typeof data.summary?.total === 'number' ? data.summary.total : domains.length,
			ok: typeof data.summary?.ok === 'number' ? data.summary.ok : fallbackSummary.ok,
			warn: typeof data.summary?.warn === 'number' ? data.summary.warn : fallbackSummary.warn,
			fail: typeof data.summary?.fail === 'number' ? data.summary.fail : fallbackSummary.fail
		},
		domains,
		history
	};
};

export const parseDomainCheckDate = (timestamp: string) => new Date(timestamp);

const domainRunBucket = (timestamp: string) => {
	const date = parseDomainCheckDate(timestamp);
	date.setUTCMinutes(0, 0, 0);
	return date.toISOString().replace('.000Z', 'Z');
};

export type DomainRunSummary = {
	timestamp: string;
	total: number;
	ok: number;
	warn: number;
	fail: number;
	minResponseMs: number;
	averageResponseMs: number;
	maxResponseMs: number;
};

export const getDomainRunSummaries = (history: CloudflareDomainCheck[]): DomainRunSummary[] => {
	const grouped = new Map<string, CloudflareDomainCheck[]>();
	for (const row of history) {
		const bucket = domainRunBucket(row.timestamp);
		const group = grouped.get(bucket) ?? [];
		group.push(row);
		grouped.set(bucket, group);
	}

	return [...grouped.entries()]
		.map(([timestamp, rows]) => {
			const responseRows = rows.filter((row) => typeof row.responseMs === 'number');
			const responseTotal = responseRows.reduce((total, row) => total + (row.responseMs ?? 0), 0);
			const responseValues = responseRows.map((row) => row.responseMs ?? 0);
			return {
				timestamp,
				total: rows.length,
				ok: rows.filter((row) => row.status === 'ok').length,
				warn: rows.filter((row) => row.status === 'warn').length,
				fail: rows.filter((row) => row.status === 'fail').length,
				minResponseMs: responseValues.length > 0 ? Math.min(...responseValues) : 0,
				averageResponseMs: responseRows.length > 0 ? responseTotal / responseRows.length : 0,
				maxResponseMs: responseValues.length > 0 ? Math.max(...responseValues) : 0
			};
		})
		.sort((a, b) => +parseDomainCheckDate(a.timestamp) - +parseDomainCheckDate(b.timestamp));
};

export const getWeakestTlsDomain = (
	domains: CloudflareDomainCheck[]
): CloudflareDomainCheck | undefined =>
	[...domains]
		.filter((domain) => typeof domain.tlsDaysLeft === 'number')
		.sort((a, b) => (a.tlsDaysLeft ?? Infinity) - (b.tlsDaysLeft ?? Infinity))[0];

export const formatDomainDateTime = (timestamp: string) =>
	new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}).format(parseDomainCheckDate(timestamp));
