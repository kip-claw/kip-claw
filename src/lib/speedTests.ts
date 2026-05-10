export type SpeedTest = {
	timestamp: string;
	downloadMbps: number;
	uploadMbps: number;
	pingMs: number;
	server: string;
	provider: string;
};

const isSpeedTest = (value: unknown): value is SpeedTest => {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.timestamp === 'string' &&
		typeof candidate.downloadMbps === 'number' &&
		typeof candidate.uploadMbps === 'number' &&
		typeof candidate.pingMs === 'number' &&
		typeof candidate.server === 'string' &&
		typeof candidate.provider === 'string'
	);
};

export const parseSpeedTestsData = (raw: unknown): SpeedTest[] =>
	Array.isArray(raw) ? raw.filter(isSpeedTest) : [];

export const parseSpeedTestDate = (timestamp: string) => new Date(timestamp.replace(' ', 'T'));

export type SpeedTestsSummary = {
	sortedTests: SpeedTest[];
	latest: SpeedTest | undefined;
	averageDownload: number;
	averageUpload: number;
};

export const getSpeedTestsSummary = (tests: SpeedTest[]): SpeedTestsSummary => {
	const sortedTests = [...tests].sort(
		(a, b) => +parseSpeedTestDate(a.timestamp) - +parseSpeedTestDate(b.timestamp)
	);

	const totalDownload = tests.reduce((total, test) => total + test.downloadMbps, 0);
	const totalUpload = tests.reduce((total, test) => total + test.uploadMbps, 0);

	return {
		sortedTests,
		latest: sortedTests.at(-1),
		averageDownload: tests.length > 0 ? totalDownload / tests.length : 0,
		averageUpload: tests.length > 0 ? totalUpload / tests.length : 0
	};
};
