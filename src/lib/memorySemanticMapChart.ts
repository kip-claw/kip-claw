import { hierarchy, treemap, treemapResquarify, type HierarchyRectangularNode } from 'd3-hierarchy';
import type { OpenClawMemoryMapSnapshot, OpenClawMemoryMapTreeNode } from './openclawMemoryMap';

type ClusterLegend = {
	id: number;
	family: string;
	label: string;
	description: string;
	size: number;
	sharePct: number;
	color: string;
	keywords: string[];
};

type FamilyRect = {
	id: string;
	label: string;
	color: string;
	x: number;
	y: number;
	width: number;
	height: number;
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
	familyRects: FamilyRect[];
	clusterRects: ClusterRect[];
	keywordRects: KeywordRect[];
};

const margin = { top: 16, right: 0, bottom: 12, left: 0 };
const familyPalette = [
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

const hexToRgb = (hex: string): [number, number, number] => {
	const clean = hex.replace('#', '');
	const expanded =
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean;
	const int = Number.parseInt(expanded, 16);
	return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
};

const rgbToHex = (r: number, g: number, b: number): string =>
	`#${[r, g, b]
		.map((v) =>
			Math.max(0, Math.min(255, Math.round(v)))
				.toString(16)
				.padStart(2, '0')
		)
		.join('')}`;

const tintHex = (hex: string, amount: number): string => {
	const [r, g, b] = hexToRgb(hex);
	const mix = (channel: number) => channel + (255 - channel) * amount;
	return rgbToHex(mix(r), mix(g), mix(b));
};

const clamp = (value: number, min: number, max: number): number =>
	Math.max(min, Math.min(max, value));

const computeChartHeight = (width: number): number => {
	if (width <= 520) {
		return clamp(Math.round(width * 1.28), 420, 760);
	}
	if (width <= 840) {
		return clamp(Math.round(width * 0.88), 380, 620);
	}
	return clamp(Math.round(width * 0.58), 360, 560);
};

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
	children: [
		{
			id: 'family:all',
			label: 'Topics',
			children: clusters.map((cluster) => ({
				id: `cluster:${cluster.id}`,
				clusterId: cluster.id,
				label: cluster.label,
				description: cluster.description,
				children: buildKeywordChildren(cluster)
			}))
		}
	]
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

const collectClusterFamilies = (tree?: OpenClawMemoryMapTreeNode): Map<number, string> => {
	const families = new Map<number, string>();
	if (!tree?.children?.length) {
		return families;
	}

	for (const familyNode of tree.children) {
		const familyLabel = familyNode.label || 'General';
		for (const clusterNode of familyNode.children ?? []) {
			const clusterId =
				typeof clusterNode.clusterId === 'number'
					? clusterNode.clusterId
					: parseClusterIdFromNode(clusterNode);
			if (typeof clusterId === 'number') {
				families.set(clusterId, familyLabel);
			}
		}
	}

	return families;
};

const collectFamilyOrder = (tree?: OpenClawMemoryMapTreeNode): string[] => {
	if (!tree?.children?.length) {
		return [];
	}
	return tree.children.map((child) => child.label || 'General');
};

export const buildMemorySemanticMapChart = (
	snapshot: OpenClawMemoryMapSnapshot,
	width: number
): MemorySemanticMapChartModel => {
	const points = snapshot.points ?? [];
	const familyByClusterId = collectClusterFamilies(snapshot.tree);
	const rawClusters: Omit<ClusterLegend, 'color'>[] = (snapshot.clusters ?? []).map((cluster) => ({
		id: cluster.id,
		family: familyByClusterId.get(cluster.id) ?? 'General',
		label: cluster.label,
		description: cluster.description ?? 'General memory topics',
		size: cluster.size,
		sharePct: points.length ? (cluster.size / points.length) * 100 : 0,
		keywords: cluster.keywords ?? []
	}));

	const familyOrder = collectFamilyOrder(snapshot.tree);
	for (const cluster of rawClusters) {
		if (!familyOrder.includes(cluster.family)) {
			familyOrder.push(cluster.family);
		}
	}

	const familyColor = new Map(
		familyOrder.map((family, idx) => [family, familyPalette[idx % familyPalette.length]])
	);

	const familyCounts = new Map<string, number>();
	for (const cluster of rawClusters) {
		familyCounts.set(cluster.family, (familyCounts.get(cluster.family) ?? 0) + 1);
	}

	const familySeen = new Map<string, number>();
	const clusters: ClusterLegend[] = rawClusters.map((cluster) => {
		const seen = (familySeen.get(cluster.family) ?? 0) + 1;
		familySeen.set(cluster.family, seen);
		const total = familyCounts.get(cluster.family) ?? 1;
		const base = familyColor.get(cluster.family) ?? '#888888';
		const tint = total <= 1 ? 0.12 : 0.1 + ((seen - 1) / Math.max(1, total - 1)) * 0.14;
		return {
			...cluster,
			color: tintHex(base, tint)
		};
	});

	const chartHeight = computeChartHeight(width);

	const clusterById = new Map(clusters.map((cluster) => [cluster.id, cluster]));
	const rootData = treeFromSnapshot(snapshot, clusterById);

	const root = hierarchy(rootData)
		.sum((node) => node.value ?? 0)
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

	const treemapRoot = treemap<TreemapDatum>()
		.tile(treemapResquarify)
		.size([
			Math.max(1, width - margin.left - margin.right),
			Math.max(1, chartHeight - margin.top - margin.bottom)
		])
		.round(true)
		.paddingOuter(0)
		.paddingTop((node) => (node.depth === 1 ? 18 : node.depth === 2 ? 14 : 0))
		.paddingInner(2)(root);

	const familyRects: FamilyRect[] = [];
	const clusterRects: ClusterRect[] = [];
	const keywordRects: KeywordRect[] = [];

	for (const node of treemapRoot.descendants() as HierarchyRectangularNode<TreemapDatum>[]) {
		if (node.depth === 1) {
			const familyColorValue = familyColor.get(node.data.label) ?? '#999999';
			familyRects.push({
				id: node.data.id,
				label: node.data.label,
				color: familyColorValue,
				x: node.x0 + margin.left,
				y: node.y0 + margin.top,
				width: Math.max(0, node.x1 - node.x0),
				height: Math.max(0, node.y1 - node.y0)
			});
		}

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
		height: chartHeight,
		margin,
		clusters,
		familyRects,
		clusterRects,
		keywordRects
	};
};
