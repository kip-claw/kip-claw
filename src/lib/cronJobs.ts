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

export function buildHeatmap(
	data: CronJobSnapshot[],
	maxDays = 7
): {
	rows: CronHeatmapRow[];
	dates: string[];
} {
	// Group snapshots by date, keeping only the latest snapshot per day
	const byDate = new Map<string, CronJobSnapshot[]>();
	for (const r of data) {
		const date = r.timestamp.split(' ')[0];
		const existing = byDate.get(date);
		if (!existing) {
			byDate.set(date, [r]);
		} else {
			// If this timestamp is newer than what we have, replace
			if (r.timestamp > existing[0].timestamp) {
				byDate.set(date, [r]);
			} else if (r.timestamp === existing[0].timestamp) {
				existing.push(r);
			}
		}
	}

	const dates = [...byDate.keys()].sort().slice(-maxDays);
	const jobNames = [...new Set(data.map((r) => r.jobName))].sort();

	const rows: CronHeatmapRow[] = jobNames.map((jobName) => ({
		jobName,
		cells: dates.map((date) => {
			const snapshot = byDate.get(date) ?? [];
			const record = snapshot.find((r) => r.jobName === jobName);
			const status = record ? (record.status === '' ? 'idle' : record.status) : 'idle';
			return { date, status };
		})
	}));

	return { rows, dates };
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
