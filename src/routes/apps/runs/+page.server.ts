import { buildRunsChart } from '$lib/runsChart';
import { runs } from '$lib/runs';

export const load = () => ({
	runsChart: buildRunsChart(runs)
});
