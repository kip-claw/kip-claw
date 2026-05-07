<script lang="ts">
	import type { SpeedTest } from './speedTests';
	import { parseSpeedTestDate } from './speedTests';

	type Props = {
		tests: SpeedTest[];
	};

	type Point = {
		x: number;
		y: number;
		test: SpeedTest;
		average: number;
	};

	const width = 920;
	const height = 430;
	const margin = { top: 26, right: 26, bottom: 52, left: 58 };
	const plotWidth = width - margin.left - margin.right;
	const plotHeight = height - margin.top - margin.bottom;
	const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

	let { tests }: Props = $props();

	const sorted = $derived(
		[...tests].sort((a, b) => +parseSpeedTestDate(a.timestamp) - +parseSpeedTestDate(b.timestamp))
	);
	const dates = $derived(sorted.map((test) => +parseSpeedTestDate(test.timestamp)));
	const minDate = $derived(Math.min(...dates));
	const maxDate = $derived(Math.max(...dates));
	const maxDownload = $derived(Math.max(...sorted.map((test) => test.downloadMbps)));
	const yMax = $derived(Math.ceil(maxDownload / 100) * 100);

	const xScale = (value: number) => {
		if (maxDate === minDate) return margin.left + plotWidth / 2;
		return margin.left + ((value - minDate) / (maxDate - minDate)) * plotWidth;
	};

	const yScale = (value: number) => margin.top + plotHeight - (value / yMax) * plotHeight;

	const rollingAverage = (test: SpeedTest) => {
		const current = +parseSpeedTestDate(test.timestamp);
		const window = sorted.filter((candidate) => {
			const candidateTime = +parseSpeedTestDate(candidate.timestamp);
			return candidateTime <= current && candidateTime >= current - sevenDaysMs;
		});

		return window.reduce((total, candidate) => total + candidate.downloadMbps, 0) / window.length;
	};

	const points = $derived<Point[]>(
		sorted.map((test) => ({
			x: xScale(+parseSpeedTestDate(test.timestamp)),
			y: yScale(test.downloadMbps),
			test,
			average: rollingAverage(test)
		}))
	);

	const averagePath = $derived(
		points
			.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${yScale(point.average)}`)
			.join(' ')
	);

	const yTicks = $derived([0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax]);
	const xTicks = $derived(
		[
			sorted[0],
			sorted[Math.floor(sorted.length / 3)],
			sorted[Math.floor((sorted.length * 2) / 3)],
			sorted[sorted.length - 1]
		].filter(Boolean)
	);

	const formatDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
	const formatTimestamp = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});
</script>

<section class="chart-section" aria-labelledby="speed-chart-title">
	<div class="chart-heading">
		<div>
			<p class="eyebrow">Speed tests</p>
			<h2 id="speed-chart-title">Download speed over time</h2>
		</div>
		<div class="legend" aria-label="Chart legend">
			<span><i class="dot"></i> Test</span>
			<span><i class="line"></i> 7-day average</span>
		</div>
	</div>

	<div class="chart-frame">
		<svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="chart-title chart-desc">
			<title id="chart-title">Download speed results and 7-day rolling average</title>
			<desc id="chart-desc">
				Every speed test is plotted as a dot in megabits per second. The line shows the 7-day
				rolling average.
			</desc>
			{#each yTicks as tick}
				<line
					class="grid-line"
					x1={margin.left}
					x2={width - margin.right}
					y1={yScale(tick)}
					y2={yScale(tick)}
				/>
				<text class="axis-label y-label" x={margin.left - 12} y={yScale(tick) + 4}
					>{Math.round(tick)}</text
				>
			{/each}
			<text class="axis-title" x={margin.left} y={margin.top - 10}>Mbps</text>
			<line
				class="axis-line"
				x1={margin.left}
				x2={width - margin.right}
				y1={height - margin.bottom}
				y2={height - margin.bottom}
			/>
			{#each xTicks as test}
				{@const date = +parseSpeedTestDate(test.timestamp)}
				<text class="axis-label x-label" x={xScale(date)} y={height - margin.bottom + 28}>
					{formatDate.format(date)}
				</text>
			{/each}
			<path class="average-line" d={averagePath} />
			{#each points as point}
				<circle class="test-dot" cx={point.x} cy={point.y} r="4.8">
					<title>
						{formatTimestamp.format(parseSpeedTestDate(point.test.timestamp))}: {point.test.downloadMbps.toFixed(
							2
						)}
						Mbps
					</title>
				</circle>
			{/each}
		</svg>
	</div>
</section>

<style>
	.chart-section {
		margin-bottom: var(--space-8);
	}

	.chart-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-5);
		margin-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-line);
		padding-bottom: var(--space-3);
	}

	.eyebrow {
		margin: 0 0 var(--space-1);
		color: var(--color-accent-secondary);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
	}

	h2 {
		margin: 0;
		font-size: var(--font-size-3xl);
		line-height: var(--line-height-snug);
	}

	.legend {
		display: flex;
		gap: var(--space-4);
		color: var(--color-muted);
		font-size: var(--font-size-xs);
		white-space: nowrap;
	}

	.legend span {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.dot {
		width: 9px;
		height: 9px;
		border-radius: 999px;
		background: var(--color-accent);
	}

	.line {
		width: 24px;
		height: 2px;
		background: var(--color-text);
	}

	.chart-frame {
		overflow-x: auto;
		border-bottom: 1px solid var(--color-line);
		padding-bottom: var(--space-2);
	}

	svg {
		display: block;
		min-width: 760px;
		width: 100%;
		height: auto;
	}

	.grid-line {
		stroke: var(--color-line);
		stroke-width: 1;
	}

	.axis-line {
		stroke: var(--color-text);
		stroke-width: 1.3;
	}

	.axis-label,
	.axis-title {
		fill: var(--color-muted);
		font-size: 13px;
	}

	.y-label {
		text-anchor: end;
	}

	.x-label {
		text-anchor: middle;
	}

	.average-line {
		fill: none;
		stroke: var(--color-text);
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.test-dot {
		fill: var(--color-accent);
		fill-opacity: 0.76;
		stroke: var(--color-background);
		stroke-width: 1.4;
	}

	@media (max-width: 760px) {
		.chart-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-3);
		}

		.legend {
			flex-wrap: wrap;
			white-space: normal;
		}
	}
</style>
