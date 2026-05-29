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
	clipped: boolean;
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

	const xScale = scaleTime()
		.domain([dated[0].parsedDate, dated.at(-1)!.parsedDate])
		.range([margin.left, width - margin.right]);

	const yScale = scaleLinear()
		.domain([0, yMax])
		.nice()
		.range([height - margin.bottom, margin.top]);

	const formatMs = (v: number) => `${v.toFixed(0)} ms`;
	const points: DomainChartPoint[] = dated.map((run) => {
		const clipped = run.averageResponseMs > yMax;
		const maxClipped = run.maxResponseMs > yMax;
		const tooltipSuffix = maxClipped ? ` (max ${formatMs(run.maxResponseMs)} off scale)` : '';
		return {
			x: xScale(run.parsedDate),
			y: yScale(clamp(run.averageResponseMs)),
			r: run.fail > 0 ? 6 : run.warn > 0 ? 5 : 4,
			title: `${formatTooltipDate.format(run.parsedDate)}: ${formatMs(run.minResponseMs)}–${formatMs(run.maxResponseMs)}, ${formatMs(run.averageResponseMs)} average, ${run.fail} failing${tooltipSuffix}`,
			clipped
		};
	});

	const averageLinePath =
		line<DatedRun>()
			.x((r) => xScale(r.parsedDate))
			.y((r) => yScale(clamp(r.averageResponseMs)))(dated) ?? '';

	const minLinePath =
		line<DatedRun>()
			.x((r) => xScale(r.parsedDate))
			.y((r) => yScale(clamp(r.minResponseMs)))(dated) ?? '';

	const maxLinePath =
		line<DatedRun>()
			.x((r) => xScale(r.parsedDate))
			.y((r) => yScale(clamp(r.maxResponseMs)))(dated) ?? '';

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
		averageLinePath,
		minLinePath,
		maxLinePath,
		bandPath,
		points
	};
};
