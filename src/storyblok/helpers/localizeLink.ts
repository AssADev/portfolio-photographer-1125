import locales from '#utils/locales.json';

import type { StoryblokMultilink } from '#types/component-types-sb.js';

import { HOME_SLUG } from '#storyblok/helpers/specialSlugs';

export const removeLinkFields = ['id', 'prep', 'story', 'cached_url'] as const;

/**
 * Localizes a Storyblok multilink based on the specified language.
 *
 * This function modifies the provided link object by updating its URL property
 * to include the appropriate language prefix and path. It handles both default
 * language links and alternate language versions.
 *
 * @param {StoryblokMultilink} link - The Storyblok multilink object to localize
 * @param {string} language - The target language code (defaults to the first language in locales)
 *
 * @example
 * // Localizes a link for the French language
 * localizeLink(navItem.link, 'fr')
 *
 * @remarks
 * - For the default language, it prefixes the URL with the default locale and the story's real path
 * - For alternate languages, it uses the alternate path and updates the story name if available
 * - The function normalizes paths by removing leading/trailing slashes
 * - For home pages in alternate languages, it removes 'home' from the path
 * - All resulting URLs are prefixed with a leading slash
 */
export function localizeLink(link: StoryblokMultilink, language: string) {
	if (link.linktype === 'story' && link.story) {
		// Use full_slug instead of default_full_slug (which is null in link resolution) :
		const fullSlug = (link.story as any).full_slug || '';
		const trimmedPath = fullSlug.replace(/^\/*|\/*$/g, '').replace(HOME_SLUG, '');

		// Check if we have translated slugs for alternate languages :
		const translatedSlugs = (link.story as any).translated_slugs;
		const alt = translatedSlugs?.find((alt: any) => alt.lang === language);

		if (locales[0] === language) {
			link.url = trimmedPath;
			link.name = link.story.name;
		} else if (alt) {
			link.url = [alt.lang, alt.path.replace(/^\/*|\/*$/g, '').replace(HOME_SLUG, '')].filter(Boolean).join('/');
			link.name = alt.name;
		} else {
			link.url = trimmedPath;
			link.name = link.story.name;
		}
		link.component = (link.story as any).content?.component;
		link.url = `/${link.url}`;
	}

	removeLinkFields.forEach((field) => delete link[field]);
}
