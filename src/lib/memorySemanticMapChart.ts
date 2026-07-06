import { hierarchy, treemap, type HierarchyRectangularNode } from 'd3-hierarchy';
import type { OpenClawMemoryMapSnapshot, OpenClawMemoryMapTreeNode } from './openclawMemoryMap';

type ClusterLegend = {
	id: number;
	label: string;
	description: string;
	size: number;
	sharePct: number;
	color: string;
	keywords: string[];
};

type ClusterRect = {
	id: number;
	label: string;
	description: string;
	size: number;
	color: string;
	x: number;
	y: number;
	width: number;
	height: number;
};

type KeywordRect = {
	clusterId: number;
	keyword: string;
	color: string;
	x: number;
	y: number;
	width: number;
	height: number;
	title: string;
};

type TreemapDatum = {
	id: string;
	clusterId?: number;
	label: string;
	description?: string;
	color?: string;
	value?: number;
	children?: TreemapDatum[];
};

export type MemorySemanticMapChartModel = {
	width: number;
	height: number;
	margin: { top: number; right: number; bottom: number; left: number };
	clusters: ClusterLegend[];
	clusterRects: ClusterRect[];
	keywordRects: KeywordRect[];
};

const height = 360;
const margin = { top: 20, right: 20, bottom: 18, left: 20 };
const palette = [
	'#cb2a2f',
	'#1f7a8c',
	'#f18f01',
	'#5f0f40',
	'#2a9d8f',
	'#4d4dff',
	'#8a5a44',
	'#3a5a40'
];

const minimumTileValue = 1;

const buildKeywordChildren = (cluster: ClusterLegend): TreemapDatum[] => {
	const keywords = (cluster.keywords ?? []).slice(0, 5).filter((k) => k.trim().length > 0);
	if (!keywords.length) {
		return [
			{
				id: `cluster:${cluster.id}:keyword:core`,
				label: 'Core',
				value: Math.max(minimumTileValue, cluster.size)
			}
		];
	}

	const weights = keywords.map((_, idx) => keywords.length - idx);
	const weightTotal = weights.reduce((sum, value) => sum + value, 0);

	return keywords.map((keyword, idx) => ({
		id: `cluster:${cluster.id}:keyword:${idx}`,
		label: keyword,
		value: Math.max(minimumTileValue, (cluster.size * weights[idx]) / weightTotal)
	}));
};

const treeFromClusters = (clusters: ClusterLegend[]): TreemapDatum => ({
	id: 'root',
	label: 'Memory',
	children: clusters.map((cluster) => ({
		id: `cluster:${cluster.id}`,
		clusterId: cluster.id,
		label: cluster.label,
		description: cluster.description,
		children: buildKeywordChildren(cluster)
	}))
});

const parseClusterIdFromNode = (node: OpenClawMemoryMapTreeNode): number | undefined => {
	if (typeof node.clusterId === 'number') {
		return node.clusterId;
	}
	const match = node.id.match(/^cluster:(-?\d+)$/);
	return match ? Number(match[1]) : undefined;
};

const treeFromSnapshot = (
	snapshot: OpenClawMemoryMapSnapshot,
	clusterById: Map<number, ClusterLegend>
): TreemapDatum => {
	const inputTree = snapshot.tree;
	if (!inputTree || !Array.isArray(inputTree.children) || inputTree.children.length === 0) {
		return treeFromClusters(Array.from(clusterById.values()));
	}

	const convert = (node: OpenClawMemoryMapTreeNode): TreemapDatum => {
		const clusterId = parseClusterIdFromNode(node);
		const cluster = typeof clusterId === 'number' ? clusterById.get(clusterId) : undefined;
		return {
			id: node.id,
			clusterId,
			label: node.label,
			description: node.description ?? cluster?.description,
			color: cluster?.color,
			value: node.value,
			children: node.children?.map(convert)
		};
	};

	return convert(inputTree);
};

export const buildMemorySemanticMapChart = (
	snapshot: OpenClawMemoryMapSnapshot,
	width: number
): MemorySemanticMapChartModel => {
	const points = snapshot.points ?? [];
	const clusters: ClusterLegend[] = (snapshot.clusters ?? []).map((cluster, idx) => ({
		id: cluster.id,
		label: cluster.label,
		description: cluster.description ?? 'General memory topics',
		size: cluster.size,
		sharePct: points.length ? (cluster.size / points.length) * 100 : 0,
		color: palette[idx % palette.length],
		keywords: cluster.keywords ?? []
	}));

	const clusterById = new Map(clusters.map((cluster) => [cluster.id, cluster]));
	const rootData = treeFromSnapshot(snapshot, clusterById);

	const root = hierarchy(rootData)
		.sum((node) => node.value ?? 0)
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

	const treemapRoot = treemap<TreemapDatum>()
		.size([
			Math.max(1, width - margin.left - margin.right),
			Math.max(1, height - margin.top - margin.bottom)
		])
		.paddingOuter(4)
		.paddingTop(22)
		.paddingInner(2)(root);

	const clusterRects: ClusterRect[] = [];
	const keywordRects: KeywordRect[] = [];

	for (const node of treemapRoot.descendants() as HierarchyRectangularNode<TreemapDatum>[]) {
		const isClusterNode = typeof node.data.clusterId === 'number';
		if (isClusterNode) {
			const data = node.data;
			const clusterId = data.clusterId;
			if (typeof clusterId !== 'number') {
				continue;
			}
			const cluster = clusterById.get(clusterId);
			clusterRects.push({
				id: clusterId,
				label: data.label,
				description: data.description ?? cluster?.description ?? 'General memory topics',
				size: Math.round(node.value ?? 0),
				color: data.color ?? cluster?.color ?? '#888888',
				x: node.x0 + margin.left,
				y: node.y0 + margin.top,
				width: Math.max(0, node.x1 - node.x0),
				height: Math.max(0, node.y1 - node.y0)
			});
		}

		const parent = node.parent;
		const parentClusterId = parent?.data.clusterId;
		if (typeof parentClusterId === 'number' && !isClusterNode) {
			const clusterNode = node.parent;
			if (!clusterNode) continue;
			const clusterId = clusterNode.data.clusterId;
			if (typeof clusterId !== 'number') {
				continue;
			}
			const cluster = clusterById.get(clusterId);
			const clusterLabel = clusterNode.data.label;
			const clusterColor = clusterNode.data.color ?? cluster?.color ?? '#888888';
			const keyword = node.data.label;
			keywordRects.push({
				clusterId,
				keyword,
				color: clusterColor,
				x: node.x0 + margin.left,
				y: node.y0 + margin.top,
				width: Math.max(0, node.x1 - node.x0),
				height: Math.max(0, node.y1 - node.y0),
				title: `${clusterLabel}: ${keyword}`
			});
		}
	}

	return {
		width,
		height,
		margin,
		clusters,
		clusterRects,
		keywordRects
	};
};
