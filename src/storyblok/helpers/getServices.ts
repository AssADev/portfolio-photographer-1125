import { useStoryblokApi } from '@storyblok/astro';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/astro';

import locales from '#utils/locales.json';

import type { StoryblokService } from '#types/component-types-sb.js';

import logger from '#lib/logger.ts';

/**
 * Fetches all services from Storyblok.
 *
 * @param excludedServices - The services (or UUIDs) to exclude.
 * @param language - The language to fetch services in.
 * @param isPreviewMode - Whether to fetch draft or published services.
 * @returns An array of services.
 */
export async function getServices(
	excludedServices: (ISbStoryData<StoryblokService> | string)[] | undefined,
	language = locales[0],
	isPreviewMode: boolean
) {
	const storyblokApi = useStoryblokApi();

	const queryBaseParams: ISbStoriesParams = {
		language,
		version: isPreviewMode ? 'draft' : 'published',
		content_type: 'Service'
	};

	try {
		const pageSpecificResponse = await storyblokApi.get('cdn/stories', queryBaseParams);

		const allServices: ISbStoryData<StoryblokService>[] = pageSpecificResponse.data.stories || [];

		if (!excludedServices || excludedServices.length === 0) {
			return allServices;
		}

		const excludedUuids = excludedServices.map((s) => (typeof s === 'string' ? s : s.uuid));

		return allServices.filter((s) => !excludedUuids.includes(s.uuid));
	} catch (error) {
		logger.error('Error fetching services', error);
		return [];
	}
}
