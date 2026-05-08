export type PublishedSkill = {
	slug: string;
	title: string;
	description: string;
	path: string;
	markdownUrl: string;
};

export type SkillMetadata = {
	name?: string;
	description?: string;
	[key: string]: string | undefined;
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

	// Match description field which might span multiple lines
	// Handles both single-line and wrapped YAML values
	const descMatch = body.match(/description:\s*(.+?)(?=\n[a-z]+:|$)/is);
	if (!descMatch) {
		return '';
	}

	// Join wrapped lines and clean up
	return descMatch[1]
		.trim()
		.split('\n')
		.map(line => line.trim())
		.join(' ')
		.replace(/^"|"$/g, '');
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

export function parseFrontmatter(markdown: string): { metadata: SkillMetadata; content: string } {
	const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

	if (!frontmatterMatch) {
		return { metadata: {}, content: markdown };
	}

	const frontmatterText = frontmatterMatch[1] ?? '';
	const content = frontmatterMatch[2] ?? '';

	const metadata: SkillMetadata = {};
	const lines = frontmatterText.split('\n');
	let currentKey = '';
	let currentValue = '';

	for (const line of lines) {
		if (line.match(/^[a-z_]+:/i)) {
			// New key found
			if (currentKey) {
				metadata[currentKey] = currentValue.trim().replace(/^"|"$/g, '');
			}
			const [key, ...valueParts] = line.split(':');
			currentKey = key.trim();
			currentValue = valueParts.join(':').trim();
		} else if (currentKey && line.trim()) {
			// Continuation of previous value
			currentValue += ' ' + line.trim();
		}
	}

	// Don't forget the last key-value pair
	if (currentKey) {
		metadata[currentKey] = currentValue.trim().replace(/^"|"$/g, '');
	}

	return { metadata, content };
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
