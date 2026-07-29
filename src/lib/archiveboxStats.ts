import raw from './archiveboxStats.json';

export type ArchiveBoxDay = { date: string; items: number };
export type ArchiveBoxStats = {
	generatedAt: string;
	version: string;
	items: number;
	dataBytes: number;
	history: ArchiveBoxDay[];
};

export const archiveboxStats = raw as ArchiveBoxStats;
