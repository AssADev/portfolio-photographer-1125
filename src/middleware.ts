import { onRequest as storyblokMiddleware } from '@storyblok/astro/middleware.ts';
import { defineMiddleware, sequence } from 'astro:middleware';
import { AsyncLocalStorage } from 'node:async_hooks';

import locales from '#utils/locales.json';
import parseUrl from '#utils/parseUrl.ts';

import { isPreviewMode } from '#lib/previewMode.ts';
import { getRouteList } from '#storyblok/helpers/routeList';
import { specialApiSlugs } from '#storyblok/helpers/specialSlugs';

const DEFAULT_LOCALE = locales[0];

// Per request state used by `src/utils/astro-state.ts` (the requests can be rendered concurrently) :
const globalForState = globalThis as { __astroStateStorage?: AsyncLocalStorage<Record<string, unknown>> };
const stateStorage = (globalForState.__astroStateStorage ??= new AsyncLocalStorage());

/**
 * Routes which are not handled by the Storyblok catch-all page :
 */
const isInternalRoute = (pathname: string) =>
	pathname.startsWith('/_astro/') ||
	pathname.startsWith('/_image') ||
	pathname.startsWith('/_vercel/') ||
	pathname.includes('/_server-islands/') ||
	specialApiSlugs.some((slug) => pathname === `/${slug}` || pathname.startsWith(`/${slug}/`));

/**
 * 404 and 500 are known routes :
 */
const isErrorRoute = (pathname: string) => /^\/(?:[a-z]{2}\/)?(?:404|500)\/?$/.test(pathname);

/**
 * Set headers on a response, even if its headers are immutable (e.g. `Response.redirect()`) :
 */
const withHeaders = (response: Response, headers: Record<string, string>) => {
	try {
		for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
		return response;
	} catch {
		const clone = new Response(response.body, response);
		for (const [key, value] of Object.entries(headers)) clone.headers.set(key, value);
		return clone;
	}
};

const stateMiddleware = defineMiddleware((_context, next) => stateStorage.run({ language: DEFAULT_LOCALE }, next));

const previewMiddleware = defineMiddleware((context, next) => {
	const isPreview = isPreviewMode(context.request);
	context.locals.isPreviewMode = isPreview;

	if (isPreview) return storyblokMiddleware(context, next);

	return next();
});

const headersMiddleware = defineMiddleware(async (context, next) => {
	const response = await next();
	const isPreview = context.locals.isPreviewMode;

	return withHeaders(response, {
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
		// The preview is displayed in the Storyblok Visual Editor, the production site must not be framed :
		'Content-Security-Policy': isPreview
			? "frame-ancestors 'self' https://app.storyblok.com"
			: "frame-ancestors 'self'",
		// The preview must never be indexed nor cached (the content changes all the time) :
		...(isPreview ? { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' } : {})
	});
});

/**
 * The default locale is never prefixed (e.g. `/fr/biography` -> `/biography`) :
 */
const defaultLocaleMiddleware = defineMiddleware(({ url, redirect }, next) => {
	const match = url.pathname.match(new RegExp(`^/${DEFAULT_LOCALE}(/.*)?$`));
	if (match) return redirect(`${match[1] || '/'}${url.search}`, 301);

	return next();
});

/**
 * Validate that the requested route exists in Storyblok before rendering it,
 * so unknown URLs (bots, typos...) don't trigger any Storyblok request for the story.
 */
const validateRoute = defineMiddleware(async ({ url, locals }, next) => {
	if (isInternalRoute(url.pathname) || isErrorRoute(url.pathname)) return next();

	// The preview can display unpublished stories, the page itself will return a 404 if needed :
	if (locals.isPreviewMode) return next();

	const currentPath = url.pathname.replace(/^\/*|\/*$/g, '');
	if (!currentPath) return next();

	// Get all valid routes (cached by the Storyblok client) :
	const routes = await getRouteList();
	if (routes.includes(currentPath)) return next();

	const { language } = parseUrl(url.pathname);
	return next(language && language !== DEFAULT_LOCALE ? `/${language}/404` : '/404');
});

// Run the middleware sequence :
export const onRequest = sequence(
	stateMiddleware,
	previewMiddleware,
	headersMiddleware,
	defaultLocaleMiddleware,
	validateRoute
);
