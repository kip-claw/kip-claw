export type Cigar = {
	dateAdded: string;
	maker: string;
	model: string;
	wrapper: string;
	origin: string;
	size: string;
	gauge: string;
	notes: string;
};

export type HumidityReading = {
	date: string;
	time: string;
	rh: string;
	notes: string;
};

export type BovedaChange = {
	dateChanged: string;
	packType: string;
	rh: string;
	packCount: string;
	notes: string;
};

export type HumidorData = {
	cigars: Cigar[];
	humidityReadings: HumidityReading[];
	bovedaChanges: BovedaChange[];
};

export const parseHumidityData = (raw: unknown): HumidorData => {
	const data = (raw ?? {}) as Partial<HumidorData>;
	return {
		cigars: data.cigars ?? [],
		humidityReadings: data.humidityReadings ?? [],
		bovedaChanges: data.bovedaChanges ?? []
	};
};

export const parseHumidityDate = (date: string, time?: string): Date => {
	if (time) {
		return new Date(`${date}T${time}`);
	}
	return new Date(date);
};

export type HumidorSummary = {
	sortedReadings: HumidityReading[];
	latestRh: number;
	averageRh: number;
	cigarCount: number;
	daysSinceBoveda: number;
};

export const getHumidorSummary = (data: HumidorData, now: Date = new Date()): HumidorSummary => {
	const sortedReadings = [...data.humidityReadings]
		.filter((r) => !isNaN(parseFloat(r.rh)))
		.sort(
			(a, b) =>
				+parseHumidityDate(a.date, a.time || undefined) -
				+parseHumidityDate(b.date, b.time || undefined)
		);

	const latest = sortedReadings.at(-1);
	const latestRh = latest ? parseFloat(latest.rh) : NaN;

	const averageRh =
		sortedReadings.length > 0
			? sortedReadings.reduce((sum, r) => sum + parseFloat(r.rh), 0) / sortedReadings.length
			: NaN;

	const sortedBoveda = [...data.bovedaChanges]
		.filter((b) => b.dateChanged)
		.sort((a, b) => a.dateChanged.localeCompare(b.dateChanged));
	const latestBoveda = sortedBoveda.at(-1);
	const daysSinceBoveda = latestBoveda
		? Math.floor((+now - +new Date(latestBoveda.dateChanged)) / (1000 * 60 * 60 * 24))
		: NaN;

	return {
		sortedReadings,
		latestRh,
		averageRh,
		cigarCount: data.cigars.length,
		daysSinceBoveda
	};
};
