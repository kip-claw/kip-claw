import { extent, max } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { area, line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import type { ChartFrameModel } from './chartShared';
import type { HumidityReading } from './humidor';
import { parseHumidityDate } from './humidor';

type DatedReading = HumidityReading & {
	parsedDate: Date;
	rhValue: number;
};

type ChartPoint = {
	x: number;
	y: number;
	title: string;
};

export type HumidityChartModel = ChartFrameModel & {
	points: ChartPoint[];
	linePath: string;
	targetBandPath: string;
	targetMin: number;
	targetMax: number;
};

const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };
const formatDate = timeFormat('%b %-d');
const formatTimestamp = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit'
});

const TARGET_RH_MIN = 65;
const TARGET_RH_MAX = 72;

export const buildHumidityChart = (
	readings: HumidityReading[],
	width: number
): HumidityChartModel => {
	const dated: DatedReading[] = readings
		.map((r) => ({
			...r,
			parsedDate: parseHumidityDate(r.date, r.time || undefined),
			rhValue: parseFloat(r.rh)
		}))
		.filter((r) => !isNaN(r.rhValue))
		.sort((a, b) => +a.parsedDate - +b.parsedDate);

	const dateExtent = extent(dated, (r) => r.parsedDate);
	const maxRh = max(dated, (r) => r.rhValue) ?? 75;
	const yMin = Math.min(TARGET_RH_MIN - 5, Math.min(...dated.map((r) => r.rhValue)) - 2);
	const yMax = Math.max(maxRh, TARGET_RH_MAX) + 5;

	const xScale = scaleTime()
		.domain([dateExtent[0] ?? new Date(), dateExtent[1] ?? new Date()])
		.range([margin.left, width - margin.right]);

	const yScale = scaleLinear()
		.domain([yMin, yMax])
		.nice()
		.range([height - margin.bottom, margin.top]);



	// Target band area path
	const bandPath =
		area<Date>()
			.x((d) => xScale(d))
			.y0(() => yScale(TARGET_RH_MIN))
			.y1(() => yScale(TARGET_RH_MAX))([
			dateExtent[0] ?? new Date(),
			dateExtent[1] ?? new Date()
		]) ?? '';

	return {
		width,
		height,
		margin,
		targetMin: TARGET_RH_MIN,
		targetMax: TARGET_RH_MAX,
		yTicks: yScale.ticks(5).map((tick) => ({
			y: yScale(tick),
			label: Math.round(tick).toString()
		})),
		xTicks: xScale.ticks(4).map((tick) => ({
			x: xScale(tick),
			label: formatDate(tick)
		})),
		points: dated.map((r) => ({
			x: xScale(r.parsedDate),
			y: yScale(r.rhValue),
			title: `${formatTimestamp.format(r.parsedDate)}: ${r.rhValue}% RH`
		})),
		linePath:
			line<DatedReading>()
				.x((r) => xScale(r.parsedDate))
				.y((r) => yScale(r.rhValue))(dated) ?? '',
		targetBandPath: bandPath
	};
};
