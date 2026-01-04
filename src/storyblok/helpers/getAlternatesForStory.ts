import type { ISbStoryData } from '@storyblok/astro';
import { join } from 'node:path';

import locales from '#utils/locales.json';
import localesRegions from '#utils/localesRegions.ts';

import { HOME_SLUG } from '#storyblok/helpers/specialSlugs';

export default function (base: string, story: Partial<ISbStoryData>, currentLocale: string) {
	const localizedSlugs: { hrefLang: string; href: URL | string }[] = [];
	const normalizedSlug =
		story.full_slug
			?.replace(/^\//, '')
			.replace(new RegExp(`^${currentLocale}\/?`), '')
			.replace(HOME_SLUG, '') || '';

	for (const locale of locales) {
		if (locale === currentLocale) continue;

		// If target locale is default, do not prefix with locale :
		const href =
			locale === locales[0]
				? new URL(normalizedSlug, base).toString()
				: new URL(join(locale, normalizedSlug), base).toString();

		localizedSlugs.push({
			hrefLang: localesRegions[locale],
			href
		});
	}

	return localizedSlugs.filter((entry, idx, arr) => idx === arr.findIndex((e) => e.hrefLang === entry.hrefLang));
}
