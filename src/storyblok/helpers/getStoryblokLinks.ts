import type { ISbStoryData } from '@storyblok/astro';
import { join } from 'node:path';
// @ts-expect-error storyblokApiInstance is a virtual module
import { storyblokApiInstance as storyblokApi } from 'virtual:storyblok-init';

import locales from '#utils/locales.json';

import { extractImagesFromStory } from '#storyblok/helpers/extractImagesFromStory';
import {
	HOME_SLUG,
	forbiddenSlugs,
	pageContentTypes,
	previewSlugs,
	removeHomeSlug
} from '#storyblok/helpers/specialSlugs';

export interface ProcessedLink {
	originalPath: string;
	trimmedPath: string;
	slug: string;
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
			!forbiddenSlugs.some((forbidden) => {
				const normalizedForbidden = forbidden.replace(/\/$/, '');
				return trimmedPath.split('/').includes(normalizedForbidden);
			})
		) {
			processedLinks.push({
				originalPath: link.real_path,
				trimmedPath,
				slug: (link.slug || trimmedPath).replace(/^\/*|\/*$/g, ''),
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
 * Helper function to build a URL path from language and slug :
 */
export function buildUrlPath(lang: string, slug: string): string {
	let processedSlug = slug;
	if (slug === HOME_SLUG) processedSlug = '/';

	return webJoin(lang, processedSlug).replace(/^\/*|\/*$/g, '');
}

/**
 * Helper function to get all route paths from processed links :
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

				// Extract the first path segment (e.g., "en" in "en/biography") :
				const firstSegment = normalized.split('/')[0];

				// If the path already starts with a locale :
				if (locales.includes(firstSegment)) {
					// Only generate the route for the matching locale (avoid combinations like en/fr or fr/en) :
					if (firstSegment === locale) {
						routeList.push(normalized);
					} else {
						// Generate the base route for other locales (e.g. "/en" when current path is "en/biography") :
						routeList.push(locale);
					}
				} else {
					// For default locale, we push the normalized path AS IS (no prefix) :
					locale === locales[0] ? routeList.push(normalized) : routeList.push(webJoin(locale, normalized));
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
	lastmod?: string;
	images?: Array<{
		url: string;
	}>;
}

/**
 * Generates the sitemap entries : one entry per page and per language, each one listing all its language versions
 * (hreflang, as recommended by Google), with the real publication date and the pictures of the page.
 */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
	const links = await getStoryblokLinks();
	const entries: SitemapEntry[] = [];
	const processedPaths = new Set<string>();

	// Fetch all stories to get their content type, publication date and pictures :
	const allStories: ISbStoryData[] = await storyblokApi.getAll('cdn/stories', {
		version: 'published'
	});

	const storiesBySlug = new Map(allStories.map((story) => [story.full_slug.replace(/^\/*|\/*$/g, ''), story]));

	for (const link of links) {
		if (processedPaths.has(link.trimmedPath)) continue;
		processedPaths.add(link.trimmedPath);

		const story = storiesBySlug.get(link.slug) ?? storiesBySlug.get(link.trimmedPath || HOME_SLUG);
		const component = story?.content?.component;

		// Only the pages (not the forms, the config...), except the "links" pages which are not indexed :
		if (!story || !component || !pageContentTypes.includes(component) || component === 'Links') continue;

		// Localized URLs (the translated slugs are used when they exist) :
		const urls = locales.map((locale) => {
			const alternate = link.alternates.find((alt) => alt.lang === locale && alt.translated_slug);
			const slug = removeHomeSlug((alternate?.translated_slug ?? link.trimmedPath).replace(/^\/*|\/*$/g, ''));

			return { lang: locale, url: webJoin('/', locale === locales[0] ? '' : locale, slug) };
		});

		const alternates = [...urls, { lang: 'x-default', url: urls[0].url }];
		const images = extractImagesFromStory(story).map(({ url }) => ({ url }));
		const lastmod = story.published_at || story.updated_at || undefined;

		for (const { url } of urls) {
			entries.push({ url, links: alternates, lastmod, images });
		}
	}

	return entries;
}
