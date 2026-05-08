export type PublishedSkill = {
	slug: string;
	title: string;
	description: string;
	path: string;
	markdownUrl: string;
};

const OWNER = 'kip-claw';
const REPO = 'skills';
const BRANCH = 'main';

const ROOT_API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

function slugToTitle(slug: string): string {
	return slug
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function extractFrontmatterDescription(markdown: string): string {
	const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) {
		return '';
	}

	const body = frontmatterMatch[1] ?? '';
	const line = body
		.split('\n')
		.find((entry) => entry.trim().toLowerCase().startsWith('description:'));

	if (!line) {
		return '';
	}

	return line.replace(/^[^:]+:/, '').trim().replace(/^"|"$/g, '');
}

async function fetchText(url: string): Promise<string> {
	const response = await fetch(url, {
		headers: {
			Accept: 'text/plain'
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status}`);
	}

	return response.text();
}

export async function listPublishedSkills(): Promise<PublishedSkill[]> {
	const response = await fetch(ROOT_API, {
		headers: {
			Accept: 'application/vnd.github+json'
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch skills index: ${response.status}`);
	}

	type ContentItem = {
		name: string;
		type: 'file' | 'dir';
	};

	const items = (await response.json()) as ContentItem[];
	const dirs = items
		.filter((item) => item.type === 'dir')
		.map((item) => item.name)
		.sort((a, b) => a.localeCompare(b));

	const skills = await Promise.all(
		dirs.map(async (slug) => {
			const markdownUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${slug}/SKILL.md`;
			const description = extractFrontmatterDescription(await fetchText(markdownUrl));

			return {
				slug,
				title: slugToTitle(slug),
				description,
				path: `${slug}/SKILL.md`,
				markdownUrl
			} satisfies PublishedSkill;
		})
	);

	return skills;
}

export async function fetchPublishedSkillMarkdown(slug: string): Promise<string> {
	const markdownUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${slug}/SKILL.md`;
	return fetchText(markdownUrl);
}
