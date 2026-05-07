import { posts } from '$lib/posts';

const site = 'https://kip.computer';

const staticPages = ['/', '/blog/', '/stats/', '/soul/'];

export const prerender = true;

export function GET() {
	const urls = [
		...staticPages.map((path) => `${site}${path}`),
		...posts.map((post) => `${site}/blog/${post.slug}/`)
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
