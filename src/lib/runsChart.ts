import { extent, max, mean } from 'd3-array';
import { scaleBand, scaleLinear, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import type { Run } from './runs';
import { parseRunDate, parseDistanceMiles } from './runs';

type DatedRun = Run & {
	parsedDate: Date;
	miles: number;
};

type ChartBar = {
	x: number;
	y: number;
	width: number;
	height: number;
	title: string;
};

type ChartTick = {
	x?: number;
	y?: number;
	label: string;
};

export type RunsChartModel = {
	width: number;
	height: number;
	margin: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
	yTicks: ChartTick[];
	xTicks: ChartTick[];
	bars: ChartBar[];
	averagePath: string;
};

const width = 780;
const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
const minimumYMax = 1;

const formatDate = timeFormat('%b %-d');
const formatTimestamp = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric'
});

export const buildRunsChart = (runs: Run[]): RunsChartModel => {
	const dated: DatedRun[] = runs
		.map((r) => ({
			...r,
			parsedDate: parseRunDate(r.date),
			miles: parseDistanceMiles(r.distance)
		}))
		.filter((r) => r.miles > 0 && !isNaN(+r.parsedDate))
		.sort((a, b) => +a.parsedDate - +b.parsedDate);

	const dateExtent = extent(dated, (r) => r.parsedDate);
	const maxMiles = max(dated, (r) => r.miles) ?? 0;
	const yMax = Math.max(maxMiles, minimumYMax) * 1.25;
	const firstDate = dateExtent[0] ?? new Date();

	const bandScale = scaleBand<number>()
		.domain(dated.map((_, i) => i))
		.range([margin.left, width - margin.right])
		.padding(0.2);

	const yScale = scaleLinear()
		.domain([0, yMax])
		.nice()
		.range([height - margin.bottom, margin.top]);

	const xTimeScale = scaleTime()
		.domain([dateExtent[0] ?? new Date(), dateExtent[1] ?? new Date()])
		.range([margin.left, width - margin.right]);

	// 7-day rolling average
	const averagePoints = dated.map((r) => {
		const current = +r.parsedDate;
		if (current - +firstDate < sevenDaysMs) {
			return { date: r.parsedDate, average: null as number | null };
		}
		const window = dated.filter((c) => {
			const t = +c.parsedDate;
			return t <= current && t >= current - sevenDaysMs;
		});
		return {
			date: r.parsedDate,
			average: mean(window, (c) => c.miles) ?? null
		};
	});

	return {
		width,
		height,
		margin,
		yTicks: yScale.ticks(5).map((tick) => ({
			y: yScale(tick),
			label: Math.round(tick).toString()
		})),
		xTicks: xTimeScale.ticks(5).map((tick) => ({
			x: xTimeScale(tick),
			label: formatDate(tick)
		})),
		bars: dated.map((r, i) => {
			const barY = yScale(r.miles);
			return {
				x: bandScale(i) ?? 0,
				y: barY,
				width: bandScale.bandwidth(),
				height: height - margin.bottom - barY,
				title: `${formatTimestamp.format(r.parsedDate)}: ${r.miles.toFixed(1)} mi`
			};
		}),
		averagePath:
			line<(typeof averagePoints)[number]>()
				.defined((p) => p.average !== null)
				.x((p) => xTimeScale(p.date))
				.y((p) => yScale(p.average ?? 0))(averagePoints) ?? ''
	};
};
