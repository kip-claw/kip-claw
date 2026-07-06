export type OpenClawMemoryMapCluster = {
	id: number;
	label: string;
	description?: string;
	keywords?: string[];
	size: number;
};

export type OpenClawMemoryMapPoint = {
	x: number;
	y: number;
	cluster: number;
	path: string;
	source: string;
};

export type OpenClawMemoryMapTreeNode = {
	id: string;
	label: string;
	value: number;
	clusterId?: number;
	description?: string;
	children?: OpenClawMemoryMapTreeNode[];
};

export type OpenClawMemoryMapSnapshot = {
	timestamp: string;
	method: string;
	pointCount: number;
	clusterCount: number;
	excludedCronChunks?: number;
	excludedShortChunks?: number;
	clusters: OpenClawMemoryMapCluster[];
	points: OpenClawMemoryMapPoint[];
	tree?: OpenClawMemoryMapTreeNode;
};

export const emptyMemoryMapSnapshot: OpenClawMemoryMapSnapshot = {
	timestamp: '',
	method: '',
	pointCount: 0,
	clusterCount: 0,
	excludedCronChunks: 0,
	excludedShortChunks: 0,
	clusters: [],
	points: [],
	tree: {
		id: 'root',
		label: 'Memory',
		value: 0,
		children: []
	}
};
