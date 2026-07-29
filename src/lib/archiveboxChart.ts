import { extent, max } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import type { ChartFrameModel } from './chartShared';
import type { ArchiveBoxDay } from './archiveboxStats';

export type ArchiveBoxChartModel = ChartFrameModel & {
	path: string;
	points: Array<{ x: number; y: number; title: string }>;
};
const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };
const formatDate = timeFormat('%b %-d');

export const buildArchiveBoxChart = (
	rows: ArchiveBoxDay[],
	width: number
): ArchiveBoxChartModel => {
	const dated = rows
		.map((row) => ({ ...row, date: new Date(`${row.date}T00:00:00`) }))
		.sort((a, b) => +a.date - +b.date);
	const range = extent(dated, (row) => row.date);
	const yMax = Math.max(max(dated, (row) => row.items) ?? 0, 1) * 1.15;
	const x = scaleTime()
		.domain([range[0] ?? new Date(), range[1] ?? new Date()])
		.range([margin.left, width - margin.right]);
	const y = scaleLinear()
		.domain([0, yMax])
		.nice()
		.range([height - margin.bottom, margin.top]);
	return {
		width,
		height,
		margin,
		yTicks: y.ticks(5).map((value) => ({ y: y(value), label: Math.round(value).toLocaleString() })),
		xTicks: x.ticks(4).map((value) => ({ x: x(value), label: formatDate(value) })),
		path:
			line<(typeof dated)[number]>()
				.x((row) => x(row.date))
				.y((row) => y(row.items))(dated) ?? '',
		points: dated.map((row) => ({
			x: x(row.date),
			y: y(row.items),
			title: `${formatDate(row.date)}: ${row.items.toLocaleString()} archived items`
		}))
	};
};
