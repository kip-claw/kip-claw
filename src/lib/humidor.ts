import humidorJson from './humidor.json';

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
	temperatureF: string;
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

const data = humidorJson as HumidorData;

export const cigars: Cigar[] = data.cigars ?? [];
export const humidityReadings: HumidityReading[] = data.humidityReadings ?? [];
export const bovedaChanges: BovedaChange[] = data.bovedaChanges ?? [];

export const parseHumidityDate = (date: string, time?: string): Date => {
	if (time) {
		return new Date(`${date}T${time}`);
	}
	return new Date(date);
};
