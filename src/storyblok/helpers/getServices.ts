import { useStoryblokApi } from '@storyblok/astro';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/astro';

import locales from '#utils/locales.json';

import type { StoryblokService } from '#types/component-types-sb.js';

import logger from '#lib/logger.ts';

/**
 * Fetches all services from Storyblok.
 *
 * @param pageId - The ID of the page to fetch services for.
 * @param language - The language to fetch services in.
 * @param isPreviewMode - Whether to fetch draft or published services.
 * @returns An array of services.
 */
export async function getServices(pageId: string, language = locales[0], isPreviewMode: boolean) {
	const storyblokApi = useStoryblokApi();

	const queryBaseParams: ISbStoriesParams = {
		language,
		version: isPreviewMode ? 'draft' : 'published',
		content_type: 'Service'
	};

	try {
		const pageSpecificResponse = await storyblokApi.get('cdn/stories', queryBaseParams);

		const allServices: ISbStoryData<StoryblokService>[] = pageSpecificResponse.data.stories || [];

		return allServices;
	} catch (error) {
		logger.error('Error fetching services', error);
		return [];
	}
}
