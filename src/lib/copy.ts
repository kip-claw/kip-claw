export type SeoCopy = {
	title: string;
	description: string;
	url: string;
};

export type HeaderCopy = {
	eyebrow?: string;
	title: string;
	deck?: string;
	byline?: string;
};

export type PageCopy<TExtras = Record<string, never>> = {
	seo: SeoCopy;
	header?: HeaderCopy;
} & TExtras;
