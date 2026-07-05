import { extent } from 'd3-array';
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
	points: ChartPoint[];
	averagePath: string;
};

const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };
const windowSize = 7;

const formatDate = timeFormat('%b %-d');
const formatTimestamp = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit'
});

const parseMemoryDate = (value: string): Date => new Date(value.replace(' ', 'T'));

const rollingAverage = (values: number[], index: number): number | null => {
	if (index < windowSize - 1) {
		return null;
	}

	const window = values.slice(index - (windowSize - 1), index + 1);
	const sum = window.reduce((total, value) => total + value, 0);
	return sum / window.length;
};

export const buildMemoryCoverageChart = (
	rows: OpenClawMemorySnapshot[],
	width: number
): MemoryChartModel => {
	const dated = [...rows]
		.map((row) => ({ ...row, date: parseMemoryDate(row.timestamp) }))
		.sort((a, b) => +a.date - +b.date);

	const dateExtent = extent(dated, (row) => row.date);
	const xScale = scaleTime()
		.domain([dateExtent[0] ?? new Date(), dateExtent[1] ?? new Date()])
		.range([margin.left, width - margin.right]);
	const yScale = scaleLinear()
		.domain([0, 100])
		.range([height - margin.bottom, margin.top]);

	const averages = dated.map((row, index) => ({
		date: row.date,
		average: rollingAverage(
			dated.map((item) => item.coveragePct),
			index
		)
	}));

	return {
		width,
		height,
		margin,
		yTicks: yScale.ticks(5).map((tick) => ({
			y: yScale(tick),
			label: `${Math.round(tick)}%`
		})),
		xTicks: xScale.ticks(4).map((tick) => ({
			x: xScale(tick),
			label: formatDate(tick)
		})),
		points: dated.map((row) => ({
			x: xScale(row.date),
			y: yScale(row.coveragePct),
			title: `${formatTimestamp.format(row.date)}: ${row.coveragePct.toFixed(2)}%`
		})),
		averagePath:
			line<(typeof averages)[number]>()
				.defined((point) => point.average !== null)
				.x((point) => xScale(point.date))
				.y((point) => yScale(point.average ?? 0))(averages) ?? ''
	};
};
