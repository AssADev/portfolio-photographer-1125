import type { APIRoute } from 'astro';
import { SitemapStream, streamToPromise } from 'sitemap';

import { getSitemapEntries } from '#storyblok/helpers/getStoryblokLinks.ts';

import { handleUnexpectedError } from './api/_utils';

export const GET: APIRoute = async ({ request, site }) => {
	try {
		const stream = new SitemapStream({ hostname: site?.toString() });
		const sitemapPromise = streamToPromise(stream);

		const responseHeaders = new Headers({ 'Content-Type': 'application/xml' });

		const sitemapEntries = await getSitemapEntries();
		for (const entry of sitemapEntries) stream.write({ url: entry.url, links: entry.links });

		stream.end();

		const sitemap = await sitemapPromise;

		return new Response(sitemap.toString(), { headers: responseHeaders });
	} catch (error) {
		return handleUnexpectedError(request, error);
	}
};
