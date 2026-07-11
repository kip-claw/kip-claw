import raw from './tokenUsage.json';

export type TokenUsageDay = {
	date: string;
	calls: number;
	inputTokens: number;
	outputTokens: number;
	cacheReadTokens: number;
	totalTokens: number;
};

export type TokenUsageData = {
	generatedAt: string;
	days: TokenUsageDay[];
};

export const tokenUsageData = raw as TokenUsageData;

export const getTokenUsageSummary = (data: TokenUsageData) => {
	const days = [...data.days].sort((a, b) => a.date.localeCompare(b.date));
	const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
	const recent = days.filter((day) => day.date >= cutoff);
	const tokens30d = recent.reduce((total, day) => total + day.totalTokens, 0);
	const calls30d = recent.reduce((total, day) => total + day.calls, 0);
	return {
		days,
		tokens30d,
		calls30d,
		avgPerTurn: calls30d ? tokens30d / calls30d : 0
	};
};
