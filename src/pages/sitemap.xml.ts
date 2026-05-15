import type { APIRoute } from 'astro';
import { EnumChangefreq, type SitemapItemLoose, SitemapStream, streamToPromise } from 'sitemap';

import { getSitemapEntries } from '#storyblok/helpers/getStoryblokLinks.ts';

import { handleUnexpectedError } from './api/_utils';

export const GET: APIRoute = async ({ request, site }) => {
	try {
		const stream = new SitemapStream({ hostname: site?.toString() });
		const sitemapPromise = streamToPromise(stream);
		const responseHeaders = new Headers({ 'Content-Type': 'application/xml' });

		const sitemapEntries = await getSitemapEntries();

		for (const entry of sitemapEntries) {
			if (entry.url === 'links' || entry.url.endsWith('/links')) continue;

			const isHome = entry.url === '/' || entry.url === '';
			const isService = entry.url.includes('services');
			const isProject = entry.url.includes('projects');

			const item: SitemapItemLoose = {
				url: entry.url,
				links: entry.links,
				img: entry.images ?? [],
				lastmod: entry.lastmod ?? new Date().toISOString(),
				changefreq: isProject ? EnumChangefreq.YEARLY : EnumChangefreq.MONTHLY,
				priority: isHome ? 1.0 : isService ? 0.9 : isProject ? 0.7 : 0.8
			};

			stream.write(item);
		}

		stream.end();
		const sitemap = await sitemapPromise;
		return new Response(sitemap.toString(), { headers: responseHeaders });
	} catch (error) {
		return handleUnexpectedError(request, error);
	}
};
