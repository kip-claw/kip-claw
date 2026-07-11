import { max } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';
import { timeFormat } from 'd3-time-format';
import type { ChartFrameModel } from './chartShared';
import type { TokenUsageDay } from './tokenUsage';

export type TokenUsageChartModel = ChartFrameModel & {
	bars: Array<{ x: number; y: number; width: number; height: number; title: string }>;
};

const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 64 };
const formatDate = timeFormat('%b %-d');
const parseDay = (day: string) => new Date(`${day}T00:00:00`);
const formatInt = new Intl.NumberFormat('en-US');
const formatMillions = (value: number) =>
	value >= 1e6 ? `${(value / 1e6).toFixed(value >= 1e7 ? 0 : 1)}M` : formatInt.format(value);

export const buildTokenUsageChart = (
	days: TokenUsageDay[],
	width: number
): TokenUsageChartModel => {
	const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
	const xScale = scaleBand<string>()
		.domain(sorted.map((day) => day.date))
		.range([margin.left, width - margin.right])
		.padding(0.2);
	const maximum = max(sorted, (day) => day.totalTokens) ?? 0;
	const yScale = scaleLinear()
		.domain([0, maximum * 1.1 || 1])
		.nice()
		.range([height - margin.bottom, margin.top]);
	const baseline = height - margin.bottom;

	const bars = sorted.map((day) => {
		const x = xScale(day.date) ?? margin.left;
		const y = yScale(day.totalTokens);
		return {
			x,
			y,
			width: xScale.bandwidth(),
			height: Math.max(0, baseline - y),
			title: `${formatDate(parseDay(day.date))}: ${formatInt.format(day.totalTokens)} tokens (${formatInt.format(day.inputTokens)} in, ${formatInt.format(day.outputTokens)} out, ${formatInt.format(day.cacheReadTokens)} cache) · ${day.calls} turn${day.calls === 1 ? '' : 's'}`
		};
	});

	const tickCount = Math.min(6, sorted.length);
	const step = tickCount > 1 ? (sorted.length - 1) / (tickCount - 1) : 1;
	const xTicks = Array.from({ length: tickCount }, (_, index) => {
		const day = sorted[Math.round(index * step)];
		return {
			x: (xScale(day.date) ?? 0) + xScale.bandwidth() / 2,
			label: formatDate(parseDay(day.date))
		};
	});

	return {
		width,
		height,
		margin,
		yTicks: yScale.ticks(5).map((tick) => ({ y: yScale(tick), label: formatMillions(tick) })),
		xTicks,
		bars
	};
};
