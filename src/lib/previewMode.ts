import type { AstroGlobal } from 'astro';
import { PREVIEW_HOSTS } from 'astro:env/server';

const previewHosts = PREVIEW_HOSTS?.split(',').map((d: string) => d.trim()) ?? [];

export function isPreviewMode(requestOrAstro: Request | AstroGlobal): boolean {
	// Get the hostname from the request or Astro context
	let hostname: string;

	if (requestOrAstro instanceof Request) {
		// It's a Request object
		hostname = new URL(requestOrAstro.url).hostname;
	} else {
		// It's an AstroGlobal object
		hostname = requestOrAstro.url.hostname;
	}

	return previewHosts.some((domain: string) => hostname.includes(domain));
}
