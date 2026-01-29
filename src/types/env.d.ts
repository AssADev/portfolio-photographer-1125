import type { ISbStoryData } from '@storyblok/astro';

import type getSiteConfig from '#storyblok/helpers/getSiteConfig.ts';

import type { PageContentTypes } from './utils.ts';

declare global {
	namespace App {
		interface Locals {
			siteConfig: Awaited<ReturnType<typeof getSiteConfig>>['content'];
			isPreviewMode: boolean;
			_storyblok_preview_data: any;
			story: ISbStoryData<PageContentTypes>;
		}
	}
	interface Window {
		dataLayer: any[];
	}
	interface ImportMetaEnv {
		readonly PUBLIC_WEB3FORMS_ACCESS_KEY: string;
		readonly PUBLIC_HCAPTCHA_SITE_KEY: string;
	}
}
