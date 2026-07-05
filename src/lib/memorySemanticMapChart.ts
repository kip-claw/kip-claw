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
	description: string;
	size: number;
	sharePct: number;
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

const FRAME_TRIM_QUANTILE = 0.05;

const quantile = (values: number[], q: number): number => {
	if (!values.length) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const idx = Math.max(0, Math.min(sorted.length - 1, (sorted.length - 1) * q));
	const low = Math.floor(idx);
	const high = Math.ceil(idx);
	if (low === high) return sorted[low];
	const t = idx - low;
	return sorted[low] + (sorted[high] - sorted[low]) * t;
};

const clamp = (value: number, min: number, max: number): number =>
	Math.max(min, Math.min(max, value));

export const buildMemorySemanticMapChart = (
	snapshot: OpenClawMemoryMapSnapshot,
	width: number
): MemorySemanticMapChartModel => {
	const points = snapshot.points ?? [];
	const xValues = points.map((p) => p.x);
	const yValues = points.map((p) => p.y);
	const xExtent = extent(xValues);
	const yExtent = extent(yValues);

	const xRawMin = xExtent[0] ?? -1;
	const xRawMax = xExtent[1] ?? 1;
	const yRawMin = yExtent[0] ?? -1;
	const yRawMax = yExtent[1] ?? 1;

	const xQMin = quantile(xValues, FRAME_TRIM_QUANTILE);
	const xQMax = quantile(xValues, 1 - FRAME_TRIM_QUANTILE);
	const yQMin = quantile(yValues, FRAME_TRIM_QUANTILE);
	const yQMax = quantile(yValues, 1 - FRAME_TRIM_QUANTILE);

	const xMin = points.length > 24 ? xQMin : xRawMin;
	const xMax = points.length > 24 ? xQMax : xRawMax;
	const yMin = points.length > 24 ? yQMin : yRawMin;
	const yMax = points.length > 24 ? yQMax : yRawMax;

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
			x: xScale(clamp(point.x, xMin, xMax)),
			y: yScale(clamp(point.y, yMin, yMax)),
			color: clusterColor.get(point.cluster) ?? '#888888',
			title: `${point.path} (cluster ${point.cluster})`
		})),
		clusters: (snapshot.clusters ?? []).map((cluster, idx) => ({
			id: cluster.id,
			label: cluster.label,
			description: cluster.description ?? 'General memory topics',
			size: cluster.size,
			sharePct: points.length ? (cluster.size / points.length) * 100 : 0,
			color: palette[idx % palette.length]
		}))
	};
};
