import { useStoryblokApi } from '@storyblok/astro';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/astro';

import locales from '#utils/locales.json';

import type { StoryblokService } from '#types/component-types-sb.js';

import logger from '#lib/logger.ts';

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

		console.log(allServices);

		return allServices;
	} catch (error) {
		logger.error('Error fetching services', error);
		return [];
	}
}
