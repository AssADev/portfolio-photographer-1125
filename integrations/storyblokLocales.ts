import { apiPlugin, storyblokInit } from '@storyblok/js';
import type { AstroIntegration } from 'astro';
import { writeFileSync } from 'node:fs';

type StoryblokLocalesOptions = {
	accessToken: string;
	/** @default 'fr' */
	defaultLocale?: string;
	translationsFolder: string;
	filepath: string;
};

export default ({ accessToken, filepath, translationsFolder, defaultLocale = 'fr' }: StoryblokLocalesOptions) =>
	({
		name: 'storyblok-locales',
		hooks: {
			'astro:config:setup': async ({ command, logger, updateConfig }) => {
				if (command === 'preview' || command === 'sync') return;

				const { storyblokApi } = storyblokInit({
					accessToken,
					use: [apiPlugin]
				});
				await storyblokApi?.flushCache();

				try {
					const space = await storyblokApi?.get('cdn/spaces/me', {});
					if (!space) throw new Error('No space');

					const locales = [defaultLocale, ...space.data.space.language_codes];

					for (const locale of locales) {
						// @ts-expect-error tag is causing a problem but we need to bypass cache
						const { data } = (await storyblokApi?.get('cdn/datasource_entries', {
							datasource: 'translations',
							dimension: locale === defaultLocale ? 'default' : locale,
							per_page: 1000,
							timestamp: Date.now()
						})) as { data: { datasource_entries: [] } };
						const translations = Object.fromEntries(
							data.datasource_entries.map(({ dimension_value, value, name }) => [
								name,
								locale === defaultLocale ? value : dimension_value
							])
						);

						writeFileSync(`${translationsFolder}/${locale}.json`, JSON.stringify(translations));
						logger.info(`Generated translations for '${locale}'`);
					}

					updateConfig({
						i18n: {
							defaultLocale,
							locales,
							routing: 'manual'
						}
					});

					writeFileSync(filepath, JSON.stringify(locales));

					logger.info(`Set locales to [${locales.join(', ')}]\n`);
				} catch {
					logger.error(`Can't get space to retrieve locale codes from Storyblok`);
				}
			}
		}
	}) satisfies AstroIntegration;
