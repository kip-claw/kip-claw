export type CronJobSnapshot = {
	timestamp: string;
	jobName: string;
	status: 'ok' | 'error' | '';
	durationS: number;
	consecutiveErrors: number;
	errorReason: string;
	notes: string;
};

export type CronJobLatest = {
	jobName: string;
	status: 'ok' | 'error' | 'idle';
	durationS: number;
	consecutiveErrors: number;
	errorReason: string;
};

export type CronHeatmapRow = {
	jobName: string;
	cells: { date: string; status: 'ok' | 'error' | 'idle' }[];
};

export function getLatestSnapshot(data: CronJobSnapshot[]): CronJobLatest[] {
	if (data.length === 0) return [];
	const latestTs = data.reduce((max, r) => (r.timestamp > max ? r.timestamp : max), '');
	return data
		.filter((r) => r.timestamp === latestTs)
		.map((r) => ({
			jobName: r.jobName,
			status: (r.status === '' ? 'idle' : r.status) as 'ok' | 'error' | 'idle',
			durationS: r.durationS,
			consecutiveErrors: r.consecutiveErrors,
			errorReason: r.errorReason
		}))
		.sort((a, b) => a.jobName.localeCompare(b.jobName));
}

export function buildHeatmap(data: CronJobSnapshot[]): {
	rows: CronHeatmapRow[];
	dates: string[];
} {
	const timestamps = [...new Set(data.map((r) => r.timestamp))].sort();
	const dates = timestamps.map((ts) => ts.split(' ')[0]);
	const jobNames = [...new Set(data.map((r) => r.jobName))].sort();

	const lookup = new Map<string, CronJobSnapshot>();
	for (const r of data) {
		lookup.set(`${r.timestamp}|${r.jobName}`, r);
	}

	const rows: CronHeatmapRow[] = jobNames.map((jobName) => ({
		jobName,
		cells: timestamps.map((ts, i) => {
			const record = lookup.get(`${ts}|${jobName}`);
			const status = record ? (record.status === '' ? 'idle' : record.status) : 'idle';
			return { date: dates[i], status };
		})
	}));

	return { rows, dates: [...new Set(dates)] };
}

export function getCronSummary(latest: CronJobLatest[]) {
	const ok = latest.filter((j) => j.status === 'ok').length;
	const errored = latest.filter((j) => j.status === 'error').length;
	const idle = latest.filter((j) => j.status === 'idle').length;
	const durations = latest.filter((j) => j.durationS > 0).map((j) => j.durationS);
	const avgDuration =
		durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
	return { ok, errored, idle, total: latest.length, avgDuration };
}
