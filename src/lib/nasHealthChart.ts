import { extent } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { area } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import type { ChartFrameModel } from './chartShared';
import { parseNasHealthDate, type NasHealthSnapshot } from './nasHealth';

export type NasHealthChartModel = ChartFrameModel & {
	usedPath: string;
	freePath: string;
};

const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };
const formatDate = timeFormat('%b %-d');

export const buildNasHealthChart = (
	rows: NasHealthSnapshot[],
	width: number
): NasHealthChartModel => {
	const dated = [...rows]
		.map((row) => ({ ...row, date: parseNasHealthDate(row.timestamp) }))
		.sort((a, b) => +a.date - +b.date);
	// A single snapshot has no horizontal extent, and a one-point SVG area has
	// no visible fill. Give it a small time window and duplicate the value at
	// both ends so the current used/free split still renders.
	const chartRows =
		dated.length === 1
			? [
					{ ...dated[0], date: new Date(+dated[0].date - 12 * 60 * 60 * 1000) },
					{ ...dated[0], date: new Date(+dated[0].date + 12 * 60 * 60 * 1000) }
				]
			: dated;
	const range = extent(chartRows, (row) => row.date);
	const x = scaleTime()
		.domain([range[0] ?? new Date(), range[1] ?? new Date()])
		.range([margin.left, width - margin.right]);
	const y = scaleLinear()
		.domain([0, 100])
		.range([height - margin.bottom, margin.top]);
	const usedArea = area<(typeof dated)[number]>()
		.x((row) => x(row.date))
		.y0(y(0))
		.y1((row) => y(row.usedPercent));
	const freeArea = area<(typeof dated)[number]>()
		.x((row) => x(row.date))
		.y0((row) => y(row.usedPercent))
		.y1(y(100));

	return {
		width,
		height,
		margin,
		yTicks: y.ticks(5).map((value) => ({ y: y(value), label: `${value}%` })),
		xTicks: x.ticks(4).map((value) => ({ x: x(value), label: formatDate(value) })),
		usedPath: usedArea(chartRows) ?? '',
		freePath: freeArea(chartRows) ?? ''
	};
};
