import entriesData from './newsBosch.json';

export type NewsBoschStory = {
	title: string;
	url: string;
};

export type NewsBoschTheme = {
	name: string;
	interpretation: string;
	storyRanks: number[];
};

export type NewsBoschDirection = {
	characters: string[];
	symbolFamilies: string[];
	composition: string;
	atmosphere: string;
	palette: string;
	scale: string;
	narrativeMotion: string;
};

export type NewsBoschEntry = {
	date: string;
	displayDate: string;
	image: string;
	alt: string;
	disclosure: string;
	aiModel: string;
	skill: string;
	generatedAt: string;
	sourceRetrievedAt: string;
	themes: NewsBoschTheme[];
	stories: NewsBoschStory[];
	creativeDirection: NewsBoschDirection;
};

export type NewsBoschMonth = {
	year: string;
	month: string;
	label: string;
	href: string;
	entries: NewsBoschEntry[];
};

export type NewsBoschYear = {
	year: string;
	href: string;
	months: NewsBoschMonth[];
	entryCount: number;
};

export const newsBoschEntries = [...(entriesData as NewsBoschEntry[])].sort((a, b) =>
	b.date.localeCompare(a.date)
);

export function entryHref(entry: NewsBoschEntry): string {
	const [year, month, day] = entry.date.split('-');
	return `/apps/news-bosch/${year}/${month}/${day}/`;
}

export function getNewsBoschEntry(
	year: string,
	month: string,
	day: string
): NewsBoschEntry | undefined {
	return newsBoschEntries.find((entry) => entry.date === `${year}-${month}-${day}`);
}

export function getNewsBoschMonths(): NewsBoschMonth[] {
	const groups = new Map<string, NewsBoschEntry[]>();

	for (const entry of newsBoschEntries) {
		const key = entry.date.slice(0, 7);
		groups.set(key, [...(groups.get(key) ?? []), entry]);
	}

	return [...groups.entries()].map(([key, entries]) => {
		const [year, month] = key.split('-');
		const label = new Intl.DateTimeFormat('en-US', {
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(new Date(`${key}-01T00:00:00Z`));
		return {
			year,
			month,
			label,
			href: `/apps/news-bosch/${year}/${month}/`,
			entries
		};
	});
}

export function getNewsBoschYears(): NewsBoschYear[] {
	const groups = new Map<string, NewsBoschMonth[]>();

	for (const month of getNewsBoschMonths()) {
		groups.set(month.year, [...(groups.get(month.year) ?? []), month]);
	}

	return [...groups.entries()].map(([year, months]) => ({
		year,
		href: `/apps/news-bosch/${year}/`,
		months,
		entryCount: months.reduce((total, month) => total + month.entries.length, 0)
	}));
}
