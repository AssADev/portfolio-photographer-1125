import { useStoryblokApi } from '@storyblok/astro';

import logger from '#lib/logger.ts';

/**
 * Fetch the number of items associated with a specific tag.
 * Note: The 'cdn/tags' endpoint returns the total count of content items (taggings_count)
 * for a tag across ALL content types. It does not natively support filtering by content_type.
 *
 * @param tag - The tag name to search for
 * @param isPreviewMode - Whether to use draft or published version
 * @returns The number of items associated with the tag
 */
export async function getProjectCountByTag(tag: string, isPreviewMode: boolean = false) {
	const storyblokApi = useStoryblokApi();

	try {
		const { data } = await storyblokApi.get('cdn/tags', {
			version: isPreviewMode ? 'draft' : 'published',
			per_page: 100
		});

		const tags = data.tags || [];
		const foundTag = tags.find((t: any) => t.name === tag);

		return foundTag ? foundTag.taggings_count : 0;
	} catch (error) {
		logger.error(`Error fetching tag count for ${tag}`, error);
		return 0;
	}
}
