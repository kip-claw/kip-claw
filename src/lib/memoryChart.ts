import { extent, max } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import type { ChartFrameModel } from './chartShared';
import type { OpenClawMemorySnapshot } from './openclawMemory';

type ChartPoint = {
	x: number;
	y: number;
	title: string;
};

export type MemoryChartModel = ChartFrameModel & {
	chunksPath: string;
	recallPath: string;
	chunkPoints: ChartPoint[];
	recallPoints: ChartPoint[];
};

const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };
const minimumYMax = 10;

const formatDate = timeFormat('%b %-d');
const formatTimestamp = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit'
});

const parseMemoryDate = (value: string): Date => new Date(value.replace(' ', 'T'));

export const buildMemoryTrendChart = (
	rows: OpenClawMemorySnapshot[],
	width: number
): MemoryChartModel => {
	const dated = [...rows]
		.map((row) => ({ ...row, date: parseMemoryDate(row.timestamp) }))
		.sort((a, b) => +a.date - +b.date);

	const dateExtent = extent(dated, (row) => row.date);
	const maxChunks = max(dated, (row) => row.indexedChunks) ?? 0;
	const maxRecall = max(dated, (row) => row.recallEntries) ?? 0;
	const yMax = Math.max(maxChunks, maxRecall, minimumYMax) * 1.15;

	const xScale = scaleTime()
		.domain([dateExtent[0] ?? new Date(), dateExtent[1] ?? new Date()])
		.range([margin.left, width - margin.right]);
	const yScale = scaleLinear()
		.domain([0, yMax])
		.nice()
		.range([height - margin.bottom, margin.top]);

	const buildPath = (accessor: (row: (typeof dated)[number]) => number) =>
		line<(typeof dated)[number]>()
			.x((row) => xScale(row.date))
			.y((row) => yScale(accessor(row)))(dated) ?? '';

	return {
		width,
		height,
		margin,
		yTicks: yScale.ticks(5).map((tick) => ({
			y: yScale(tick),
			label: Math.round(tick).toString()
		})),
		xTicks: xScale.ticks(4).map((tick) => ({
			x: xScale(tick),
			label: formatDate(tick)
		})),
		chunksPath: buildPath((row) => row.indexedChunks),
		recallPath: buildPath((row) => row.recallEntries),
		chunkPoints: dated.map((row) => ({
			x: xScale(row.date),
			y: yScale(row.indexedChunks),
			title: `${formatTimestamp.format(row.date)}: ${row.indexedChunks.toLocaleString()} chunks`
		})),
		recallPoints: dated.map((row) => ({
			x: xScale(row.date),
			y: yScale(row.recallEntries),
			title: `${formatTimestamp.format(row.date)}: ${row.recallEntries.toLocaleString()} recall entries`
		}))
	};
};
