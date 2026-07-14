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

/**
 * The diagnostics export uses local timestamps and has historically emitted
 * single-digit hours (for example, `2026-07-12 9:41:58`). Normalise that
 * format to an ISO-compatible local timestamp before parsing it.
 */
export const parseTranscriptionDate = (timestamp: string) => {
	const match = timestamp.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2}):(\d{2})(.*)$/);
	if (!match) return new Date(timestamp);

	const [, day, hour, minute, second, suffix] = match;
	return new Date(`${day}T${hour.padStart(2, '0')}:${minute}:${second}${suffix}`);
};

const MODEL_LABELS: Record<string, string> = {
	'ggml-base.en-q5_0.bin': 'Whisper base.en Q5_0',
	'ggml-small.en-q5_1.bin': 'Whisper small.en Q5_1'
};

const friendlyModel = (raw: string | undefined) =>
	raw ? (MODEL_LABELS[raw] ?? raw) : 'Whisper small.en Q5_1';

export const getTranscriptionSummary = (raw: TranscriptionDiagnostics) => {
	const requests = raw.requests
		.filter((request) => Number.isFinite(+parseTranscriptionDate(request.timestamp)))
		.sort((a, b) => +parseTranscriptionDate(a.timestamp) - +parseTranscriptionDate(b.timestamp));
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
