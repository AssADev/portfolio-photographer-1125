import { onRequest as storyblokMiddleware } from '@storyblok/astro/middleware.ts';
import { defineMiddleware, sequence } from 'astro:middleware';

import locales from '#utils/locales.json';
import parseUrl from '#utils/parseUrl.ts';

import { isPreviewMode } from '#lib/previewMode.ts';
import { getRouteList } from '#storyblok/helpers/routeList';

/**
 * Validate if the requested route exists in Storyblok
 * Optimized to skip validation for static assets and known routes
 */
const validateRoute = defineMiddleware(async ({ request, url, locals }, next) => {
	// Early return for static assets and server islands to avoid expensive route validation :
	if (url.pathname.startsWith('/_astro/') || url.pathname.includes('/_server-islands/')) {
		return next();
	}

	// 404 and 500 are **known** routes, so we can skip validation :
	if (requestIs404Or500(request)) {
		return next();
	}

	const response = await next();
	const type = response.headers.get('X-Astro-Route-Type');

	// If the route we're processing is not a page, then we ignore it :
	if (type !== 'page' && type !== 'fallback') {
		return response;
	}

	// Get all valid routes - this is the expensive operation :
	const routes = await getRouteList();

	const currentPath = url.pathname.replace(/^\/*|\/*$/g, '');

	// Return 404 if the route doesn't exist
	if (currentPath && !routes.includes(currentPath)) {
		const { language } = parseUrl(url.pathname);
		const target = language && language !== locales[0] ? `/${language}/404` : '/404';
		return next(target);
	}

	return response;
});

function requestIs404Or500(request: Request, base = '') {
	const url = new URL(request.url);
	const pathname = url.pathname.slice(base.length);

	return /^\/(?:[a-z]{2}\/)?404\/?$/.test(pathname) || /^\/(?:[a-z]{2}\/)?500\/?$/.test(pathname);
}

const previewMiddleware = defineMiddleware((context, next) => {
	const isPreview = isPreviewMode(context.request);
	context.locals.isPreviewMode = isPreview;

	if (isPreview) return storyblokMiddleware(context, next);

	return next();
});

const robotsMiddleware = defineMiddleware(async (context, next) => {
	const response = await next();

	// If we're in preview mode, we don't want the page to be indexed :
	if (context.locals.isPreviewMode) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}

	return response;
});

// Run the middleware sequence :
export const onRequest = sequence(previewMiddleware, robotsMiddleware, validateRoute);
