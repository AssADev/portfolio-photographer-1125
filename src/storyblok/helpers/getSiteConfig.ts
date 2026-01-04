import { type ISbStory } from '@storyblok/astro';
// @ts-expect-error storyblokApiInstance is a virtual module
import { storyblokApiInstance as storyblokApi } from 'virtual:storyblok-init';

import locales from '#utils/locales.json';

import type { StoryblokSiteConfig } from '#types/component-types-sb.js';

import logger from '#lib/logger.ts';

import normalizeStory from './normalizeStory';
import processContent from './processContent';
import resolvedRelations from './resolvedRelations';
import { configPrefix } from './specialSlugs';

/**
 * Fetches and returns the site configuration from Storyblok for a given language.
 *
 * @param - Language code (defaults to first language in locales)
 * @returns - Site configuration data
 *
 * @example
 * const config = await getSiteConfig('fr')
 */
export default async function (language: string = locales[0], preview = false) {
	if (preview) return await updateSiteConfig(language, preview);
	return await updateSiteConfig(language, preview);
}

const updateSiteConfig = async (language: string, preview = false) => {
	const { data } = (await storyblokApi.get(`cdn/stories/${configPrefix}/site-config`, {
		version: preview ? 'draft' : 'published',
		language,
		resolve_relations: resolvedRelations,
		resolve_links: 'story'
	})) as ISbStory<StoryblokSiteConfig>;

	const clone = structuredClone(data)!;

	await processContent({
		content: clone.story.content,
		language,
		siteConfig: clone.story.content,
		rootStory: clone.story,
		preview
	});

	if (!preview) {
		logger.info(`Site config for ${language} updated`);
	}

	return normalizeStory(clone.story);
};
