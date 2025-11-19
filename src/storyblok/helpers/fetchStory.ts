import { useStoryblokApi } from '@storyblok/astro';

import { pageContentTypes } from './specialSlugs';

export default async function fetchStory(slug: string, language: string, isPreviewMode: boolean) {
	const storyblokApi = useStoryblokApi();

	const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
		version: isPreviewMode ? 'draft' : 'published',
		language,
		resolve_links: 'story'
	});

	if (!pageContentTypes.includes(data?.story?.content.component)) {
		throw new Error(`Error: Not found ${slug}, in ${language}`);
	}

	return data?.story;
}
