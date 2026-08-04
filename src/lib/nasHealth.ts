export type NasHealthSnapshot = {
	timestamp: string;
	totalGb: number;
	usedGb: number;
	usedPercent: number;
	smartStatus: string;
};

export const normalizeSmartStatus = (status: string): string => {
	const normalized = status.trim().toUpperCase();
	if (normalized.includes('UNAVAILABLE')) return 'UNAVAILABLE';
	if (normalized.includes('FAIL')) return 'FAILED';
	return normalized.includes('OK') || normalized.includes('PASSED') ? 'OK' : 'UNKNOWN';
};

export const parseNasHealthData = (raw: unknown): NasHealthSnapshot[] =>
	Array.isArray(raw)
		? raw.filter((value): value is NasHealthSnapshot => {
				if (!value || typeof value !== 'object') return false;
				const row = value as Record<string, unknown>;
				return (
					typeof row.timestamp === 'string' &&
					typeof row.totalGb === 'number' &&
					typeof row.usedGb === 'number' &&
					typeof row.usedPercent === 'number' &&
					typeof row.smartStatus === 'string'
				);
			})
		: [];

export const parseNasHealthDate = (timestamp: string) => new Date(timestamp.replace(' ', 'T'));

export const getNasHealthSummary = (rows: NasHealthSnapshot[]) => {
	const sorted = [...rows].sort(
		(a, b) => +parseNasHealthDate(a.timestamp) - +parseNasHealthDate(b.timestamp)
	);
	return { sorted, latest: sorted.at(-1) };
};
