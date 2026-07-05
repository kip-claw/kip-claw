export type OpenClawMemoryMapCluster = {
	id: number;
	label: string;
	size: number;
};

export type OpenClawMemoryMapPoint = {
	x: number;
	y: number;
	cluster: number;
	path: string;
	source: string;
};

export type OpenClawMemoryMapSnapshot = {
	timestamp: string;
	method: string;
	pointCount: number;
	clusterCount: number;
	excludedCronChunks?: number;
	clusters: OpenClawMemoryMapCluster[];
	points: OpenClawMemoryMapPoint[];
};

export const emptyMemoryMapSnapshot: OpenClawMemoryMapSnapshot = {
	timestamp: '',
	method: '',
	pointCount: 0,
	clusterCount: 0,
	excludedCronChunks: 0,
	clusters: [],
	points: []
};
