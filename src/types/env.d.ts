import type getSiteConfig from '#storyblok/helpers/getSiteConfig.ts';

declare global {
	namespace App {
		interface Locals {
			siteConfig: Awaited<ReturnType<typeof getSiteConfig>>['content'];
			isPreviewMode: boolean;
			_storyblok_preview_data: any;
		}
	}
	interface Window {
		dataLayer: any[];
	}
}
