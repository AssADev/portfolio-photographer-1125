import type { APIRoute } from 'astro';
import { type SitemapItemLoose, SitemapStream, streamToPromise } from 'sitemap';

import { getSitemapEntries } from '#storyblok/helpers/getStoryblokLinks.ts';

import { handleUnexpectedError } from './api/_utils';

export const GET: APIRoute = async ({ request, site }) => {
	try {
		const stream = new SitemapStream({
			hostname: site?.toString(),
			xmlns: { news: false, video: false, xhtml: true, image: true }
		});
		const sitemapPromise = streamToPromise(stream);

		const sitemapEntries = await getSitemapEntries();

		for (const entry of sitemapEntries) {
			const item: SitemapItemLoose = {
				url: entry.url,
				links: entry.links,
				img: entry.images ?? [],
				lastmod: entry.lastmod
			};

			stream.write(item);
		}

		stream.end();
		const sitemap = await sitemapPromise;

		return new Response(sitemap.toString(), {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
			}
		});
	} catch (error) {
		return handleUnexpectedError(request, error);
	}
};
