export type TranscriptionRequest = {
	timestamp: string;
	outcome: string;
	audioSeconds: number;
	endToEndMs: number;
	latitudeProcessingMs: number;
	realTimeFactor: number;
	model: string;
	status: string;
};

export type TranscriptionDiagnostics = {
	requests: TranscriptionRequest[];
	health: unknown[];
};

export const parseTranscriptionDate = (timestamp: string) => new Date(timestamp.replace(' ', 'T'));

export const getTranscriptionSummary = (raw: TranscriptionDiagnostics) => {
	const requests = [...raw.requests].sort(
		(a, b) => +parseTranscriptionDate(a.timestamp) - +parseTranscriptionDate(b.timestamp)
	);
	const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
	const recent = requests.filter((request) => +parseTranscriptionDate(request.timestamp) >= since);
	const successful = recent.filter((request) => request.outcome === 'success');
	return {
		requests,
		model: requests.at(-1)?.model ?? 'Whisper base.en Q5_0',
		successRate: recent.length ? (successful.length / recent.length) * 100 : 0,
		audioMinutes: successful.reduce((total, request) => total + request.audioSeconds, 0) / 60
	};
};
