import { max, mean } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import type { ChartFrameModel } from './chartShared';
import type { MonthlyTweetCount } from './twitterArchive';

type ChartBar = {
	x: number;
	y: number;
	width: number;
	height: number;
	title: string;
};

export type TweetChartModel = ChartFrameModel & {
	bars: ChartBar[];
	averagePath: string;
};

const height = 360;
const margin = { top: 26, right: 20, bottom: 52, left: 54 };

export const buildTweetChart = (monthly: MonthlyTweetCount[], width: number): TweetChartModel => {
	const maxCount = max(monthly, (m) => m.count) ?? 0;
	const yMax = Math.max(maxCount, 1) * 1.1;

	const bandScale = scaleBand<number>()
		.domain(monthly.map((_, i) => i))
		.range([margin.left, width - margin.right])
		.padding(0.15);

	const yScale = scaleLinear()
		.domain([0, yMax])
		.nice()
		.range([height - margin.bottom, margin.top]);

	// X-axis labels: show ~8 evenly-spaced year labels
	const labelInterval = Math.max(1, Math.floor(monthly.length / 8));
	const xTicks = monthly
		.map((m, i) => ({ i, month: m.month }))
		.filter((_, i) => i % labelInterval === 0)
		.map((entry) => ({
			x: (bandScale(entry.i) ?? 0) + bandScale.bandwidth() / 2,
			label: entry.month.slice(0, 4)
		}));

	// 12-month rolling average
	const averagePoints = monthly.map((m, i) => {
		if (i < 11) return { x: 0, average: null as number | null };
		const window = monthly.slice(i - 11, i + 1);
		return {
			x: (bandScale(i) ?? 0) + bandScale.bandwidth() / 2,
			average: mean(window, (w) => w.count) ?? null
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
		xTicks,
		bars: monthly.map((m, i) => {
			const barY = yScale(m.count);
			return {
				x: bandScale(i) ?? 0,
				y: barY,
				width: bandScale.bandwidth(),
				height: height - margin.bottom - barY,
				title: `${m.month}: ${m.count} tweets`
			};
		}),
		averagePath:
			line<(typeof averagePoints)[number]>()
				.defined((p) => p.average !== null)
				.x((p) => p.x)
				.y((p) => yScale(p.average ?? 0))(averagePoints) ?? ''
	};
};
