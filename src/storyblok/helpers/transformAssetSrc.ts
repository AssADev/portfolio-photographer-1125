import { STORYBLOK_ASSETS_DOMAIN } from 'astro:env/server';

export function transformAssetSrc(src: string) {
	const url = new URL(src);

	if (url.hostname === 'a.storyblok.com' && STORYBLOK_ASSETS_DOMAIN) {
		url.hostname = STORYBLOK_ASSETS_DOMAIN;
	}

	return url.href;
}
