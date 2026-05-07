import { buildSpeedChart } from '$lib/speedChart';
import { speedTests } from '$lib/speedTests';

export const load = () => ({
	chart: buildSpeedChart(speedTests)
});
