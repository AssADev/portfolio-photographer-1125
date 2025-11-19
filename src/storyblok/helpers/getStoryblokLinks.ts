import { join } from 'node:path';
// @ts-expect-error storyblokApiInstance is a virtual module
import { storyblokApiInstance as storyblokApi } from 'virtual:storyblok-init';

import locales from '#utils/locales.json';
import localesRegions from '#utils/localesRegions.ts';

import { HOME_SLUG, forbiddenSlugs, previewSlugs } from './specialSlugs';

export interface ProcessedLink {
	originalPath: string;
	trimmedPath: string;
	alternates: Array<{
		lang: string;
		translated_slug: string;
	}>;
}

/**
 * Base function to fetch and process Storyblok links
 * Returns processed links that can be used for routes or sitemap entries
 */
export async function getStoryblokLinks(): Promise<ProcessedLink[]> {
	const links = await storyblokApi.getAll('cdn/links', { version: 'published' });
	const processedLinks: ProcessedLink[] = [];

	for (const link of links) {
		const trimmedPath = link.real_path?.replace(/^\/*|\/*$/g, '');

		if (
			link.real_path &&
			!link.is_folder &&
			!previewSlugs.includes(trimmedPath) &&
			!forbiddenSlugs.find((slug) => trimmedPath.startsWith(slug))
		) {
			processedLinks.push({
				originalPath: link.real_path,
				trimmedPath,
				alternates: link.alternates || []
			});
		}
	}

	return processedLinks;
}

/**
 * Helper function to join URL segments, especially for Windows paths :
 */
export function webJoin(...segments: string[]) {
	return join(...segments).replace(/\\/g, '/');
}

/**
 * Helper function to build a URL path from language and slug
 */
export function buildUrlPath(lang: string, slug: string): string {
	let processedSlug = slug;
	if (slug === HOME_SLUG) processedSlug = '/';

	return webJoin(lang, processedSlug).replace(/^\/*|\/*$/g, '');
}

/**
 * Helper function to get all route paths from processed links
 */
export function getRoutePathsFromLinks(links: ProcessedLink[]): string[] {
	const routeList: string[] = [];
	const processedPaths = new Set<string>();

	for (const link of links) {
		if (!processedPaths.has(link.trimmedPath)) {
			processedPaths.add(link.trimmedPath);

			// Add all language routes
			locales.forEach((locale) => {
				const normalized = link.trimmedPath.replace(/^\//, '');

				// Extract the first path segment (e.g., "fr" in "fr/biography") :
				const firstSegment = normalized.split('/')[0];

				// If the path already starts with a locale :
				if (locales.includes(firstSegment)) {
					// Only generate the route for the matching locale (avoid combinations like en/fr or fr/en) :
					if (firstSegment === locale) {
						routeList.push(normalized);
					} else {
						// Generate the base route for other locales (e.g. "/en" when current path is "fr/biography") :
						routeList.push(locale);
					}
				} else {
					// Path has no locale prefix (Generate route for each locale) :
					routeList.push(webJoin(locale, normalized));
				}
			});

			// Add alternate language routes :
			for (const alternate of link.alternates) {
				if (alternate.lang && alternate.lang !== locales[0] && alternate.translated_slug) {
					const alternatePath = buildUrlPath(alternate.lang, alternate.translated_slug);
					routeList.push(alternatePath);
				}
			}
		}
	}

	return [...new Set(routeList)];
}

export interface SitemapEntry {
	url: string;
	links?: Array<{
		lang: string;
		url: string;
	}>;
}

/**
 * Generates sitemap entries with alternate language links from Storyblok
 */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
	const links = await getStoryblokLinks();
	const entries: SitemapEntry[] = [];
	const processedPaths = new Set<string>();

	for (const link of links) {
		if (!processedPaths.has(link.trimmedPath)) {
			processedPaths.add(link.trimmedPath);

			// Create the main entry for the default language :
			const defaultUrl = webJoin(locales[0], link.trimmedPath);

			const entry: SitemapEntry = {
				url: defaultUrl
			};

			// Add alternate language links if they exist :
			if (link.alternates && link.alternates.length > 0) {
				entry.links = [];

				// Add the default language as a link :
				entry.links.push({
					lang: localesRegions[locales[0]],
					url: defaultUrl
				});

				// Add other language links :
				for (const alternate of link.alternates) {
					if (alternate.lang && alternate.translated_slug) {
						const alternateUrl = buildUrlPath(alternate.lang, alternate.translated_slug);

						entry.links.push({
							lang: localesRegions[alternate.lang],
							url: alternateUrl
						});
					}
				}
			}

			entries.push(entry);
		}
	}

	return entries;
}
