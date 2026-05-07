import { extent, max } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import type { SpeedTest } from './speedTests';
import { parseSpeedTestDate } from './speedTests';

export type SpeedMetric = 'download' | 'upload';

type DatedSpeedTest = SpeedTest & {
	date: Date;
};

type ChartPoint = {
	x: number;
	y: number;
	title: string;
};

type ChartTick = {
	x?: number;
	y?: number;
	label: string;
};

export type SpeedChartModel = {
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
	points: ChartPoint[];
	averagePath: string;
};

const width = 560;
const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

const formatDate = timeFormat('%b %-d');
const formatTimestamp = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit'
});

const getMbps = (test: DatedSpeedTest, metric: SpeedMetric) =>
	metric === 'download' ? test.downloadMbps : test.uploadMbps;

const rollingAverage = (test: DatedSpeedTest, tests: DatedSpeedTest[], metric: SpeedMetric) => {
	const current = +test.date;
	const window = tests.filter((candidate) => {
		const candidateTime = +candidate.date;
		return candidateTime <= current && candidateTime >= current - sevenDaysMs;
	});

	return window.reduce((total, candidate) => total + getMbps(candidate, metric), 0) / window.length;
};

export const buildSpeedChart = (
	tests: SpeedTest[],
	metric: SpeedMetric = 'download'
): SpeedChartModel => {
	const sorted = [...tests].sort(
		(a, b) => +parseSpeedTestDate(a.timestamp) - +parseSpeedTestDate(b.timestamp)
	);
	const datedTests = sorted.map((test) => ({
		...test,
		date: parseSpeedTestDate(test.timestamp)
	}));
	const dateExtent = extent(datedTests, (test) => test.date);
	const maxMbps = max(datedTests, (test) => getMbps(test, metric)) ?? 0;
	const yMax = Math.ceil(maxMbps / 100) * 100;
	const xScale = scaleTime()
		.domain([dateExtent[0] ?? new Date(), dateExtent[1] ?? new Date()])
		.range([margin.left, width - margin.right]);
	const yScale = scaleLinear()
		.domain([0, yMax])
		.nice()
		.range([height - margin.bottom, margin.top]);

	const averagePoints = datedTests.map((test) => ({
		date: test.date,
		average: rollingAverage(test, datedTests, metric)
	}));

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
		points: datedTests.map((test) => ({
			x: xScale(test.date),
			y: yScale(getMbps(test, metric)),
			title: `${formatTimestamp.format(test.date)}: ${getMbps(test, metric).toFixed(2)} Mbps`
		})),
		averagePath:
			line<(typeof averagePoints)[number]>()
				.x((point) => xScale(point.date))
				.y((point) => yScale(point.average))(averagePoints) ?? ''
	};
};
