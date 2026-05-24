import { max } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { area, line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import type { ChartFrameModel } from './chartShared';
import type { DomainRunSummary } from './cloudflareDomains';
import { parseDomainCheckDate } from './cloudflareDomains';

type DatedRun = DomainRunSummary & {
	parsedDate: Date;
};

export type DomainChartPoint = {
	x: number;
	y: number;
	r: number;
	title: string;
};

export type DomainChartModel = ChartFrameModel & {
	averageLinePath: string;
	minLinePath: string;
	maxLinePath: string;
	bandPath: string;
	points: DomainChartPoint[];
};

const height = 360;
const margin = { top: 44, right: 26, bottom: 56, left: 58 };
const formatTickDate = timeFormat('%b %-d');
const formatTooltipDate = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric'
});

export const buildCloudflareDomainChart = (
	runs: DomainRunSummary[],
	containerWidth: number
): DomainChartModel | null => {
	const dated: DatedRun[] = runs
		.filter(
			(run) =>
				Number.isFinite(run.averageResponseMs) &&
				Number.isFinite(run.minResponseMs) &&
				Number.isFinite(run.maxResponseMs)
		)
		.map((run) => ({ ...run, parsedDate: parseDomainCheckDate(run.timestamp) }))
		.sort((a, b) => +a.parsedDate - +b.parsedDate);

	if (dated.length === 0) return null;

	const width = Math.round(containerWidth);
	const maxResponse = max(dated, (r) => r.maxResponseMs) ?? 100;

	const xScale = scaleTime()
		.domain([dated[0].parsedDate, dated.at(-1)!.parsedDate])
		.range([margin.left, width - margin.right]);

	const yScale = scaleLinear()
		.domain([0, maxResponse])
		.nice()
		.range([height - margin.bottom, margin.top]);

	const points: DomainChartPoint[] = dated.map((run) => ({
		x: xScale(run.parsedDate),
		y: yScale(run.averageResponseMs),
		r: run.fail > 0 ? 6 : run.warn > 0 ? 5 : 4,
		title: `${formatTooltipDate.format(run.parsedDate)}: ${run.minResponseMs.toFixed(0)}-${run.maxResponseMs.toFixed(0)} ms, ${run.averageResponseMs.toFixed(0)} ms average, ${run.fail} failing`
	}));

	const averageLinePath =
		line<DatedRun>()
			.x((r) => xScale(r.parsedDate))
			.y((r) => yScale(r.averageResponseMs))(dated) ?? '';

	const minLinePath =
		line<DatedRun>()
			.x((r) => xScale(r.parsedDate))
			.y((r) => yScale(r.minResponseMs))(dated) ?? '';

	const maxLinePath =
		line<DatedRun>()
			.x((r) => xScale(r.parsedDate))
			.y((r) => yScale(r.maxResponseMs))(dated) ?? '';

	const bandPath =
		area<DatedRun>()
			.x((r) => xScale(r.parsedDate))
			.y0((r) => yScale(r.minResponseMs))
			.y1((r) => yScale(r.maxResponseMs))(dated) ?? '';

	return {
		width,
		height,
		margin,
		xTicks: xScale.ticks(4).map((tick) => ({
			x: xScale(tick),
			label: formatTickDate(tick)
		})),
		yTicks: yScale.ticks(5).map((tick) => ({
			y: yScale(tick),
			label: tick.toFixed(0)
		})),
		averageLinePath,
		minLinePath,
		maxLinePath,
		bandPath,
		points
	};
};
