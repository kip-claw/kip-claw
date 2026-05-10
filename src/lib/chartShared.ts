export type ChartTick = {
	x?: number;
	y?: number;
	label: string;
};

export type ChartMargin = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

export type ChartFrameModel = {
	width: number;
	height: number;
	margin: ChartMargin;
	xTicks: ChartTick[];
	yTicks: ChartTick[];
};
