import { useStoryblokApi } from '@storyblok/astro';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/astro';

import locales from '#utils/locales.json';

import type { StoryblokProject } from '#types/component-types-sb.js';

import logger from '#lib/logger.ts';
import resolvedRelations from '#storyblok/helpers/resolvedRelations';

export async function getProjects(pageId: string, language = locales[0], isPreviewMode: boolean) {
	const storyblokApi = useStoryblokApi();

	const queryBaseParams: ISbStoriesParams = {
		language,
		version: isPreviewMode ? 'draft' : 'published',
		content_type: 'Project',
		resolve_relations: resolvedRelations
	};

	try {
		const pageSpecificResponse = await storyblokApi.get('cdn/stories', queryBaseParams);

		const allProjects: ISbStoryData<StoryblokProject>[] = pageSpecificResponse.data.stories || [];

		return allProjects;
	} catch (error) {
		logger.error('Error fetching projects', error);
		return [];
	}
}
