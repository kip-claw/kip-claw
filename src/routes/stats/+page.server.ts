import { buildSpeedChart } from '$lib/speedChart';
import { speedTests } from '$lib/speedTests';

export const load = () => ({
	downloadChart: buildSpeedChart(speedTests, 'download'),
	uploadChart: buildSpeedChart(speedTests, 'upload')
});
