import { extent } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import type { ChartFrameModel } from './chartShared';
import { parseTranscriptionDate, type TranscriptionRequest } from './transcriptionDiagnostics';

type DailyPoint = { date: Date; median: number; p95: number; count: number };

export type TranscriptionChartModel = ChartFrameModel & {
	medianPath: string;
	p95Path: string;
	points: Array<{ x: number; y: number; title: string }>;
};

const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };
const formatDate = timeFormat('%b %-d');
const formatTimestamp = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const percentile = (values: number[], p: number) => {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))] ?? 0;
};

export const buildTranscriptionChart = (
	rows: TranscriptionRequest[],
	width: number
): TranscriptionChartModel => {
	const groups = new Map<string, { date: Date; values: number[] }>();
	for (const row of rows.filter((row) => row.outcome === 'success' && row.realTimeFactor > 0)) {
		const date = parseTranscriptionDate(row.timestamp);
		const key = date.toISOString().slice(0, 10);
		const group = groups.get(key) ?? { date, values: [] };
		group.values.push(row.realTimeFactor);
		groups.set(key, group);
	}
	const daily: DailyPoint[] = [...groups.values()]
		.map(({ date, values }) => ({
			date,
			median: percentile(values, 0.5),
			p95: percentile(values, 0.95),
			count: values.length
		}))
		.sort((a, b) => +a.date - +b.date);
	const dates = extent(daily, (row) => row.date);
	const maximum = Math.max(...daily.flatMap((row) => [row.median, row.p95]), 0.1);
	const xScale = scaleTime()
		.domain([dates[0] ?? new Date(), dates[1] ?? new Date()])
		.range([margin.left, width - margin.right]);
	const yScale = scaleLinear()
		.domain([0, maximum * 1.15])
		.nice()
		.range([height - margin.bottom, margin.top]);
	const buildPath = (accessor: (row: DailyPoint) => number) =>
		line<DailyPoint>()
			.x((row) => xScale(row.date))
			.y((row) => yScale(accessor(row)))(daily) ?? '';

	return {
		width,
		height,
		margin,
		yTicks: yScale.ticks(5).map((tick) => ({ y: yScale(tick), label: `${tick.toFixed(2)}×` })),
		xTicks: xScale.ticks(4).map((tick) => ({ x: xScale(tick), label: formatDate(tick) })),
		medianPath: buildPath((row) => row.median),
		p95Path: buildPath((row) => row.p95),
		points: daily.map((row) => ({
			x: xScale(row.date),
			y: yScale(row.median),
			title: `${formatTimestamp.format(row.date)}: median ${row.median.toFixed(2)}×, p95 ${row.p95.toFixed(2)}× (${row.count} request${row.count === 1 ? '' : 's'})`
		}))
	};
};
