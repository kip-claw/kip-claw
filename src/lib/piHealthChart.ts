import { extent, max, min } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import type { ChartFrameModel } from './chartShared';
import { parsePiHealthDate, type PiHealthSnapshot } from './piHealth';

type ChartPoint = {
	x: number;
	y: number;
	title: string;
};

export type PiTempChartModel = ChartFrameModel & {
	cpuPath: string;
	gpuPath: string;
	points: ChartPoint[];
	threshold: { y: number; label: string };
};

const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };
// Raspberry Pi soft-throttles its clocks at 80°C.
const throttleTempC = 80;

const formatDate = timeFormat('%b %-d');
const formatTimestamp = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit'
});

export const buildPiTempChart = (rows: PiHealthSnapshot[], width: number): PiTempChartModel => {
	const dated = [...rows]
		.map((row) => ({ ...row, date: parsePiHealthDate(row.timestamp) }))
		.sort((a, b) => +a.date - +b.date);

	const dateExtent = extent(dated, (row) => row.date);
	const minTemp = min(dated, (row) => Math.min(row.cpuTempC, row.gpuTempC)) ?? 0;
	const maxTemp = max(dated, (row) => Math.max(row.cpuTempC, row.gpuTempC)) ?? throttleTempC;
	const yMin = Math.min(Math.floor((minTemp - 5) / 10) * 10, throttleTempC - 10);
	const yMax = Math.max(Math.ceil((maxTemp + 5) / 10) * 10, throttleTempC + 5);

	const xScale = scaleTime()
		.domain([dateExtent[0] ?? new Date(), dateExtent[1] ?? new Date()])
		.range([margin.left, width - margin.right]);
	const yScale = scaleLinear()
		.domain([yMin, yMax])
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
		cpuPath: buildPath((row) => row.cpuTempC),
		gpuPath: buildPath((row) => row.gpuTempC),
		points: dated.map((row) => ({
			x: xScale(row.date),
			y: yScale(row.cpuTempC),
			title: `${formatTimestamp.format(row.date)}: CPU ${row.cpuTempC.toFixed(1)}°C, GPU ${row.gpuTempC.toFixed(1)}°C`
		})),
		threshold: { y: yScale(throttleTempC), label: `${throttleTempC}°C throttle` }
	};
};
