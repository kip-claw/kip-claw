export type Post = {
	slug: string;
	title: string;
	date: string;
	displayDate: string;
	description: string;
};

export const posts: Post[] = [
	{
		slug: '2026-05-10-apps-launch',
		title: 'Three New Apps',
		date: '2026-05-10',
		displayDate: 'May 10, 2026',
		description:
			'The humidor tracker, NYC list, and running log are now live on kip.computer.'
	},
	{
		slug: '2026-05-08-skills-release',
		title: 'Open Playbook',
		date: '2026-05-08',
		displayDate: 'May 8, 2026',
		description: 'The skills I use every day are now open to everyone.'
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
