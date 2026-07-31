import { max, median } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { area, line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import type { ChartFrameModel } from './chartShared';
import type { DomainRunSummary } from './cloudflareDomains';
import { parseDomainCheckDate } from './cloudflareDomains';

type DatedRun = DomainRunSummary & {
	parsedDate: Date;
};

export type DomainChartModel = ChartFrameModel & {
	medianLinePath: string;
	bandPath: string;
};

const height = 360;
const margin = { top: 44, right: 26, bottom: 56, left: 58 };
const formatTickDate = timeFormat('%b %-d');
const rollingMedian = (runs: DatedRun[], windowDays = 7): DatedRun[] =>
	runs.map((run, index) => {
		const windowStart = +run.parsedDate - (windowDays - 1) * 24 * 60 * 60 * 1000;
		const values = runs
			.slice(0, index + 1)
			.filter((candidate) => +candidate.parsedDate >= windowStart)
			.map((candidate) => candidate.averageResponseMs);
		return { ...run, averageResponseMs: median(values) ?? run.averageResponseMs };
	});

// Pick a robust y-axis ceiling so a single slow run doesn't squash the rest of
// the chart. Uses the 95th percentile of max values, but never less than the
// observed median max (so a flat dataset still spans the chart).
const robustCeiling = (values: number[]): number => {
	if (values.length === 0) return 100;
	const sorted = [...values].sort((a, b) => a - b);
	const quantile = (q: number) => {
		const i = Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1)));
		return sorted[i];
	};
	const p95 = quantile(0.95);
	const median = quantile(0.5);
	// Floor at 1.5x median so small datasets still have headroom.
	return Math.max(p95, median * 1.5, 50);
};

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
	const ceiling = robustCeiling(dated.map((r) => r.maxResponseMs));
	const observedMax = max(dated, (r) => r.maxResponseMs) ?? ceiling;
	const yMax = Math.min(observedMax, ceiling);
	const clamp = (v: number) => Math.min(v, yMax);
	const smoothed = rollingMedian(dated);

	const xScale = scaleTime()
		.domain([dated[0].parsedDate, dated.at(-1)!.parsedDate])
		.range([margin.left, width - margin.right]);

	const yScale = scaleLinear()
		.domain([0, yMax])
		.nice()
		.range([height - margin.bottom, margin.top]);

	const medianLinePath =
		line<DatedRun>()
			.x((r) => xScale(r.parsedDate))
			.y((r) => yScale(clamp(r.averageResponseMs)))(smoothed) ?? '';

	const bandPath =
		area<DatedRun>()
			.x((r) => xScale(r.parsedDate))
			.y0((r) => yScale(clamp(r.minResponseMs)))
			.y1((r) => yScale(clamp(r.maxResponseMs)))(dated) ?? '';

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
		medianLinePath,
		bandPath
	};
};
