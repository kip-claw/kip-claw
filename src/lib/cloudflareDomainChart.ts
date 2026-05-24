import type { ChartFrameModel } from './chartShared';
import type { DomainRunSummary } from './cloudflareDomains';
import { parseDomainCheckDate } from './cloudflareDomains';

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

const formatTickDate = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric'
});

const niceCeil = (value: number) => {
	if (value <= 100) return 100;
	if (value <= 250) return 250;
	if (value <= 500) return 500;
	if (value <= 1000) return 1000;
	return Math.ceil(value / 500) * 500;
};

export const buildCloudflareDomainChart = (
	runs: DomainRunSummary[],
	containerWidth: number
): DomainChartModel | null => {
	const rows = runs.filter(
		(run) =>
			Number.isFinite(run.averageResponseMs) &&
			Number.isFinite(run.minResponseMs) &&
			Number.isFinite(run.maxResponseMs)
	);
	if (rows.length === 0) return null;

	const width = Math.max(640, Math.round(containerWidth));
	const height = 360;
	const margin = { top: 44, right: 26, bottom: 56, left: 58 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	const maxResponse = niceCeil(Math.max(...rows.map((run) => run.maxResponseMs), 100));
	const minTime = +parseDomainCheckDate(rows[0].timestamp);
	const maxTime = +parseDomainCheckDate(rows.at(-1)!.timestamp);
	const timeSpan = Math.max(1, maxTime - minTime);

	const xFor = (timestamp: string) =>
		margin.left + ((+parseDomainCheckDate(timestamp) - minTime) / timeSpan) * innerWidth;
	const yFor = (value: number) => margin.top + innerHeight - (value / maxResponse) * innerHeight;

	const points = rows.map((run) => ({
		x: xFor(run.timestamp),
		y: yFor(run.averageResponseMs),
		r: run.fail > 0 ? 6 : run.warn > 0 ? 5 : 4,
		title: `${formatTickDate.format(parseDomainCheckDate(run.timestamp))}: ${run.minResponseMs.toFixed(0)}-${run.maxResponseMs.toFixed(0)} ms, ${run.averageResponseMs.toFixed(0)} ms average, ${run.fail} failing`
	}));

	const pathFor = (valueFor: (run: DomainRunSummary) => number) =>
		rows
			.map(
				(row, index) => `${index === 0 ? 'M' : 'L'}${xFor(row.timestamp)},${yFor(valueFor(row))}`
			)
			.join(' ');

	const averageLinePath = pathFor((run) => run.averageResponseMs);
	const minLinePath = pathFor((run) => run.minResponseMs);
	const maxLinePath = pathFor((run) => run.maxResponseMs);
	const lowerBandPoints = [...rows]
		.reverse()
		.map((row) => `L${xFor(row.timestamp)},${yFor(row.minResponseMs)}`)
		.join(' ');
	const bandPath = `${maxLinePath} ${lowerBandPoints} Z`;

	const yTicks = [0, maxResponse / 2, maxResponse].map((value) => ({
		y: yFor(value),
		label: value.toFixed(0)
	}));

	const xTicks =
		rows.length === 1
			? [
					{
						x: xFor(rows[0].timestamp),
						label: formatTickDate.format(parseDomainCheckDate(rows[0].timestamp))
					}
				]
			: [rows[0], rows[Math.floor(rows.length / 2)], rows.at(-1)!].map((row) => ({
					x: xFor(row.timestamp),
					label: formatTickDate.format(parseDomainCheckDate(row.timestamp))
				}));

	return {
		width,
		height,
		margin,
		xTicks,
		yTicks,
		averageLinePath,
		minLinePath,
		maxLinePath,
		bandPath,
		points
	};
};
