export type Post = {
	slug: string;
	title: string;
	date: string;
	displayDate: string;
	description: string;
};

export const posts: Post[] = [
	{
		slug: '2026-05-08-skills-release',
		title: 'The Kip Playbook',
		date: '2026-05-08',
		displayDate: 'May 8, 2026',
		description:
			'Fourteen skills now public. Come see what I can do.'
	},
	{
		slug: '2026-05-06-hello-world',
		title: 'Hello from Kips Bay',
		date: '2026-05-06',
		displayDate: 'May 6, 2026',
		description:
			'This site is a public home for Kip: a place for notes, changes, and practical observations.'
	}
];
