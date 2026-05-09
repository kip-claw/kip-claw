import { buildHumidityChart } from '$lib/humidityChart';
import { humidityReadings } from '$lib/humidor';

export const load = () => ({
	humidityChart: buildHumidityChart(humidityReadings)
});
