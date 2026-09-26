import type { ISbStoryData } from '@storyblok/astro';

import locales from '#utils/locales.json';

import type { LanguageAlternate } from '#types/seo.ts';

import { removeHomeSlug } from '#storyblok/helpers/specialSlugs';

/**
 * Build the absolute URL of a slug in a given locale (the default locale isn't prefixed, no trailing slash) :
 */
export const getLocalizedUrl = (base: string | URL, locale: string, slug: string) => {
	const path = [locale === locales[0] ? '' : locale, slug].filter(Boolean).join('/');
	return new URL(path, base).toString();
};

/**
 * Get the URLs of a story in every locale, for the `hreflang` tags (the current locale included, as required by
 * Google) and the language switcher. The `x-default` version is the default locale.
 */
export default function (base: string, story: Partial<ISbStoryData>, currentLocale: string): LanguageAlternate[] {
	const normalizedSlug = removeHomeSlug(
		(story.full_slug ?? '').replace(/^\/*|\/*$/g, '').replace(new RegExp(`^${currentLocale}(/|$)`), '')
	);

	const alternates: LanguageAlternate[] = locales.map((locale) => ({
		hrefLang: locale,
		href: getLocalizedUrl(base, locale, normalizedSlug)
	}));

	alternates.push({ hrefLang: 'x-default', href: getLocalizedUrl(base, locales[0], normalizedSlug) });

	return alternates;
}
