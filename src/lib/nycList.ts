import nycListJson from './nycList.json';

export type NycPlace = {
	name: string;
	address: string;
	isDecent: string;
	isRecommended: string;
	isElite: string;
	isClosed: string;
	notes: string;
	lat: number | null;
	lng: number | null;
};

const isNycPlace = (value: unknown): value is NycPlace => {
	if (!value || typeof value !== 'object') return false;
	const c = value as Record<string, unknown>;
	return typeof c.name === 'string' && typeof c.address === 'string';
};

export const nycPlaces: NycPlace[] = Array.isArray(nycListJson)
	? nycListJson.filter(isNycPlace)
	: [];

export const isYes = (value: string): boolean => value.toUpperCase() === 'Y';

export type PlaceTier = 'elite' | 'recommended' | 'decent' | 'other';

export const getPlaceTier = (place: NycPlace): PlaceTier => {
	if (isYes(place.isElite)) return 'elite';
	if (isYes(place.isRecommended)) return 'recommended';
	if (isYes(place.isDecent)) return 'decent';
	return 'other';
};

export const tierColors: Record<PlaceTier, string> = {
	elite: '#FFD700',
	recommended: '#4CAF50',
	decent: '#2196F3',
	other: '#9E9E9E'
};
