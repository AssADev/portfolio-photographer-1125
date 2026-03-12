import { useStoryblokApi } from '@storyblok/astro';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/astro';

import locales from '#utils/locales.json';

import type { StoryblokProject } from '#types/component-types-sb.js';

import logger from '#lib/logger.ts';
import normalizeStory from '#storyblok/helpers/normalizeStory';
import resolvedRelations from '#storyblok/helpers/resolvedRelations';

/**
 * Fetches all projects from Storyblok.
 *
 * @param language - The language to fetch projects in.
 * @param isPreviewMode - Whether to fetch draft or published projects.
 * @returns An array of projects.
 */
export async function getProjects(language = locales[0], isPreviewMode: boolean, tags?: string[]) {
	const storyblokApi = useStoryblokApi();

	const queryBaseParams: ISbStoriesParams = {
		language,
		version: isPreviewMode ? 'draft' : 'published',
		content_type: 'Project',
		resolve_relations: resolvedRelations
	};

	try {
		// Try fetching with tags if provided :
		if (tags && tags.length > 0) {
			const taggedResponse = await storyblokApi.get('cdn/stories', {
				...queryBaseParams,
				with_tag: tags.join(',')
			} as any);

			if (taggedResponse.data.stories?.length > 0) {
				return normalizeStory(taggedResponse.data.stories as ISbStoryData<StoryblokProject>[]);
			}
		}

		// Fallback to all projects if no tags or no projects found with tags :
		const pageSpecificResponse = await storyblokApi.get('cdn/stories', queryBaseParams);

		const allProjects: ISbStoryData<StoryblokProject>[] = normalizeStory(pageSpecificResponse.data.stories || []);

		return allProjects;
	} catch (error) {
		logger.error('Error fetching projects', error);
		return [];
	}
}
