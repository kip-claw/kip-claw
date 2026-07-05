import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import type { ChartFrameModel } from './chartShared';
import type { OpenClawMemoryMapSnapshot } from './openclawMemoryMap';

type PointRender = {
	x: number;
	y: number;
	color: string;
	title: string;
};

type ClusterLegend = {
	id: number;
	label: string;
	size: number;
	sharePct: number;
	samplePath: string;
	color: string;
};

export type MemorySemanticMapChartModel = ChartFrameModel & {
	points: PointRender[];
	clusters: ClusterLegend[];
	xZero: number;
	yZero: number;
};

const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };
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

export const buildMemorySemanticMapChart = (
	snapshot: OpenClawMemoryMapSnapshot,
	width: number
): MemorySemanticMapChartModel => {
	const points = snapshot.points ?? [];
	const xExtent = extent(points, (p) => p.x);
	const yExtent = extent(points, (p) => p.y);
	const xMin = xExtent[0] ?? -1;
	const xMax = xExtent[1] ?? 1;
	const yMin = yExtent[0] ?? -1;
	const yMax = yExtent[1] ?? 1;

	const xPad = (xMax - xMin || 1) * 0.08;
	const yPad = (yMax - yMin || 1) * 0.08;

	const xScale = scaleLinear()
		.domain([xMin - xPad, xMax + xPad])
		.range([margin.left, width - margin.right]);
	const yScale = scaleLinear()
		.domain([yMin - yPad, yMax + yPad])
		.range([height - margin.bottom, margin.top]);

	const clusterColor = new Map<number, string>();
	for (const [idx, cluster] of (snapshot.clusters ?? []).entries()) {
		clusterColor.set(cluster.id, palette[idx % palette.length]);
	}

	const pointsByCluster = new Map<number, typeof points>();
	for (const point of points) {
		const prior = pointsByCluster.get(point.cluster) ?? [];
		prior.push(point);
		pointsByCluster.set(point.cluster, prior);
	}

	return {
		width,
		height,
		margin,
		yTicks: yScale.ticks(5).map((tick) => ({
			y: yScale(tick),
			label: tick.toFixed(1)
		})),
		xTicks: xScale.ticks(5).map((tick) => ({
			x: xScale(tick),
			label: tick.toFixed(1)
		})),
		xZero: xScale(0),
		yZero: yScale(0),
		points: points.map((point) => ({
			x: xScale(point.x),
			y: yScale(point.y),
			color: clusterColor.get(point.cluster) ?? '#888888',
			title: `${point.path} (cluster ${point.cluster})`
		})),
		clusters: (snapshot.clusters ?? []).map((cluster, idx) => ({
			id: cluster.id,
			label: cluster.label,
			size: cluster.size,
			sharePct: points.length ? (cluster.size / points.length) * 100 : 0,
			samplePath: pointsByCluster.get(cluster.id)?.[0]?.path ?? '—',
			color: palette[idx % palette.length]
		}))
	};
};
