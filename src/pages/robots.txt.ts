import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL) => `
	User-agent: *
	Allow: /

	Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
	const siteMapURL = new URL('/sitemap.xml', site);
	return new Response(getRobotsTxt(siteMapURL));
};
