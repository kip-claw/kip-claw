import runsJson from './runs.json';

export type Run = {
	date: string;
	distance: string;
	route: string;
	reflections: string;
};

const isRun = (value: unknown): value is Run => {
	if (!value || typeof value !== 'object') return false;
	const c = value as Record<string, unknown>;
	return (
		typeof c.date === 'string' &&
		typeof c.distance === 'string' &&
		typeof c.route === 'string' &&
		typeof c.reflections === 'string'
	);
};

export const runs: Run[] = Array.isArray(runsJson) ? runsJson.filter(isRun) : [];

export const parseRunDate = (date: string): Date => {
	const [y, m, d] = date.split('-').map(Number);
	return new Date(y, m - 1, d);
};

/**
 * Parse a distance string like "7 miles", "5 mi", "10 km" into a numeric mile value.
 */
export const parseDistanceMiles = (distance: string): number => {
	const match = distance.match(/^([\d.]+)\s*(.*)/);
	if (!match) return 0;
	const value = parseFloat(match[1]);
	if (isNaN(value)) return 0;
	const unit = match[2].trim().toLowerCase();
	if (unit.startsWith('km') || unit.startsWith('kilo')) {
		return value * 0.621371;
	}
	return value;
};
