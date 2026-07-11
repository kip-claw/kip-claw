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

const MODEL_LABELS: Record<string, string> = {
	'ggml-base.en-q5_0.bin': 'Whisper base.en Q5_0',
	'ggml-small.en-q5_1.bin': 'Whisper small.en Q5_1'
};

const friendlyModel = (raw: string | undefined) =>
	raw ? (MODEL_LABELS[raw] ?? raw) : 'Whisper small.en Q5_1';

export const getTranscriptionSummary = (raw: TranscriptionDiagnostics) => {
	const requests = [...raw.requests].sort(
		(a, b) => +parseTranscriptionDate(a.timestamp) - +parseTranscriptionDate(b.timestamp)
	);
	const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
	const recent = requests.filter((request) => +parseTranscriptionDate(request.timestamp) >= since);
	const successful = recent.filter((request) => request.outcome === 'success');
	return {
		requests,
		model: friendlyModel(requests.at(-1)?.model),
		successRate: recent.length ? (successful.length / recent.length) * 100 : 0,
		audioMinutes: successful.reduce((total, request) => total + request.audioSeconds, 0) / 60
	};
};
