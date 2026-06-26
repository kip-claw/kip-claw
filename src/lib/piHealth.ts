export type PiHealthSnapshot = {
	timestamp: string;
	cpuTempC: number;
	gpuTempC: number;
	cpuLoad1m: number;
	cpuLoad5m: number;
	cpuLoad15m: number;
	ramUsedMb: number;
	ramTotalMb: number;
	diskUsedGb: number;
	diskTotalGb: number;
	uptimeDays: number;
};

const isPiHealthSnapshot = (value: unknown): value is PiHealthSnapshot => {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.timestamp === 'string' &&
		typeof candidate.cpuTempC === 'number' &&
		typeof candidate.gpuTempC === 'number' &&
		typeof candidate.ramUsedMb === 'number' &&
		typeof candidate.ramTotalMb === 'number' &&
		typeof candidate.diskUsedGb === 'number' &&
		typeof candidate.diskTotalGb === 'number' &&
		typeof candidate.uptimeDays === 'number'
	);
};

export const parsePiHealthData = (raw: unknown): PiHealthSnapshot[] =>
	Array.isArray(raw) ? raw.filter(isPiHealthSnapshot) : [];

export const parsePiHealthDate = (timestamp: string) => new Date(timestamp.replace(' ', 'T'));

export type PiHealthSummary = {
	sorted: PiHealthSnapshot[];
	latest: PiHealthSnapshot | undefined;
};

export const getPiHealthSummary = (rows: PiHealthSnapshot[]): PiHealthSummary => {
	const sorted = [...rows].sort(
		(a, b) => +parsePiHealthDate(a.timestamp) - +parsePiHealthDate(b.timestamp)
	);

	return {
		sorted,
		latest: sorted.at(-1)
	};
};
