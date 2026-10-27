import { useStoryblokApi } from '@storyblok/astro';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/astro';

import locales from '#utils/locales.json';

import type { StoryblokProject } from '#types/component-types-sb.js';

import logger from '#lib/logger.ts';
import normalizeStory from '#storyblok/helpers/normalizeStory';
import resolvedRelations from '#storyblok/helpers/resolvedRelations';

/**
 * Returns the uuids of the services related to a project :
 */
export const getProjectServiceUuids = (project: ISbStoryData<StoryblokProject>) =>
	(project.content.informations?.[0]?.service ?? []).map((s) => (typeof s === 'string' ? s : s.uuid));

/**
 * Fetches all projects from Storyblok.
 *
 * @param language - The language to fetch projects in.
 * @param isPreviewMode - Whether to fetch draft or published projects.
 * @param serviceUuids - If provided, only keep the projects related to one of these services.
 * @returns An array of projects.
 */
export async function getProjects(language = locales[0], isPreviewMode: boolean, serviceUuids?: string[]) {
	const storyblokApi = useStoryblokApi();

	const queryBaseParams: ISbStoriesParams = {
		language,
		version: isPreviewMode ? 'draft' : 'published',
		content_type: 'Project',
		resolve_relations: resolvedRelations,
		per_page: 100
	};

	try {
		const response = await storyblokApi.get('cdn/stories', queryBaseParams);

		const allProjects: ISbStoryData<StoryblokProject>[] = normalizeStory(response.data.stories || []);

		// Keep the projects of the same service(s) if provided :
		if (serviceUuids && serviceUuids.length > 0) {
			const serviceProjects = allProjects.filter((p) =>
				getProjectServiceUuids(p).some((uuid) => serviceUuids.includes(uuid))
			);

			if (serviceProjects.length > 2) {
				return {
					projects: serviceProjects,
					isFallback: false
				};
			}
		}

		// Fallback to all projects if no services or not enough projects found for these services :
		return {
			projects: allProjects,
			isFallback: serviceUuids && serviceUuids.length > 0 ? true : false
		};
	} catch (error) {
		logger.error('Error fetching projects', error);
		return {
			projects: [],
			isFallback: true
		};
	}
}

/**
 * Counts the projects related to a service.
 *
 * @param serviceUuid - The uuid of the service.
 * @param language - The language to fetch projects in.
 * @param isPreviewMode - Whether to count draft or published projects.
 * @returns The number of projects related to the service.
 */
export async function getProjectCountByService(serviceUuid: string, language = locales[0], isPreviewMode: boolean) {
	const { projects } = await getProjects(language, isPreviewMode);

	return projects.filter((p) => getProjectServiceUuids(p).includes(serviceUuid)).length;
}
