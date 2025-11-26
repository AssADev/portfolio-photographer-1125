import { useStoryblokApi } from '@storyblok/astro';

import { AppError } from '#lib/AppError.ts';

import resolvedRelations from './resolvedRelations';
import { pageContentTypes } from './specialSlugs';

export default async function fetchStory(slug: string, language: string, isPreviewMode: boolean) {
	const storyblokApi = useStoryblokApi();

	const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
		version: isPreviewMode ? 'draft' : 'published',
		language,
		resolve_relations: resolvedRelations,
		resolve_links: 'story'
	});

	if (!pageContentTypes.includes(data?.story?.content.component)) {
		throw AppError.notFound(slug, language);
	}

	return data?.story;
}
