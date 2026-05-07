import speedTestsJson from './speedTests.json';

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

export const speedTests: SpeedTest[] = Array.isArray(speedTestsJson)
	? speedTestsJson.filter(isSpeedTest)
	: [];

export const parseSpeedTestDate = (timestamp: string) => new Date(timestamp.replace(' ', 'T'));
