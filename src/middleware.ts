import { onRequest as storyblokMiddleware } from '@storyblok/astro/middleware.ts';
import { defineMiddleware, sequence } from 'astro:middleware';

import { getRouteList } from './storyblok/helpers/routeList';

const noop = defineMiddleware((_context, next) => next());

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
	if (currentPath && !routes.includes(currentPath)) return next('/404');

	return response;
});

function requestIs404Or500(request: Request, base = '') {
	const url = new URL(request.url);
	const pathname = url.pathname.slice(base.length);

	return /^\/404\/?$/.test(pathname) || /^\/500\/?$/.test(pathname);
}

const previewMiddleware = defineMiddleware((context, next) => {
	const isPreview = false;
	// context.locals.isPreviewMode = isPreview;

	if (isPreview) return storyblokMiddleware(context, next);

	return next();
});

// Run the middleware sequence :
export const onRequest = sequence(noop, previewMiddleware, validateRoute);
