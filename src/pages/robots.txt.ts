import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL) =>
	['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemapURL.href}`, ''].join('\n');

// The preview must never be crawled :
const PREVIEW_ROBOTS_TXT = ['User-agent: *', 'Disallow: /', ''].join('\n');

export const GET: APIRoute = ({ site, locals }) => {
	const siteMapURL = new URL('/sitemap.xml', site);

	return new Response(locals.isPreviewMode ? PREVIEW_ROBOTS_TXT : getRobotsTxt(siteMapURL), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
