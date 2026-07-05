export type OpenClawMemorySnapshot = {
	timestamp: string;
	agentId: string;
	provider: string;
	model: string;
	indexedFiles: number;
	totalFiles: number;
	indexedChunks: number;
	coveragePct: number;
	dirty: boolean;
	embeddingsReady: boolean;
	vectorReady: boolean;
	semanticVectorsReady: boolean;
	ftsReady: boolean;
	cacheEntries: number;
	batchEnabled: boolean;
	batchFailures: number;
	providerState: string;
	indexIdentity: string;
	recallEntries: number;
	recallPromoted: number;
	recallSpaced: number;
	recallConceptTagged: number;
	recallUpdatedAt: string;
	dreamCorpusFiles: number;
	dreamIngestionExists: boolean;
};

export function getLatestMemorySnapshotByAgent(
	rows: OpenClawMemorySnapshot[]
): Record<string, OpenClawMemorySnapshot> {
	const latest: Record<string, OpenClawMemorySnapshot> = {};
	for (const row of rows) {
		const prior = latest[row.agentId];
		if (!prior || row.timestamp > prior.timestamp) {
			latest[row.agentId] = row;
		}
	}
	return latest;
}
