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

export type PageCopy = {
	seo: SeoCopy;
	header?: HeaderCopy;
};
