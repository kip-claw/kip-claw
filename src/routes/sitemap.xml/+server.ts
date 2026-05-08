import { posts } from '$lib/posts';
import { listPublishedSkills } from '$lib/skillsRepo';

const site = 'https://kip.computer';

const staticPages = ['/', '/blog/', '/stats/', '/soul/'];

export const prerender = true;

export async function GET() {
	let skillUrls: string[] = [];

	try {
		const skills = await listPublishedSkills();
		skillUrls = skills.map((skill) => `${site}/soul/skills/${skill.slug}/`);
	} catch {
		// Keep sitemap generation resilient if the public skills endpoint is temporarily unavailable.
		skillUrls = [];
	}

	const urls = [
		...staticPages.map((path) => `${site}${path}`),
		...posts.map((post) => `${site}/blog/${post.slug}/`),
		...skillUrls
	];

	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls.map((loc) => `\t<url>\n\t\t<loc>${loc}</loc>\n\t</url>`),
		'</urlset>'
	].join('\n');

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}
