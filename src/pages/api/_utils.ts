import type { APIContext } from 'astro';
import { PREVIEW_HOSTS } from 'astro:env/server';
import { serializeError } from 'serialize-error';

import { createLogger } from '#lib/logger.ts';

export function withCORS(responseInit?: ResponseInit): ResponseInit {
	return {
		...responseInit,
		headers: {
			...responseInit?.headers,
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		}
	};
}

export function json(response: unknown, init?: ResponseInit): Response {
	return new Response(JSON.stringify(response, null, 2), {
		...init,
		headers: { ...init?.headers, 'Content-Type': 'application/json' }
	});
}

export function handleUnexpectedError(_request: Request, error: unknown) {
	try {
		throw error;
	} catch (e) {
		apiLogger.error(e);
	}

	return invalidRequestResponse(serializeError(error), 500);
}

export function invalidRequestResponse(error: unknown, status = 422) {
	return json(
		{
			success: false,
			error
		},
		withCORS({ status })
	);
}

export function successfulResponse(data?: unknown, status = 200) {
	return json(
		{
			success: true,
			data
		},
		withCORS({ status })
	);
}

export function isOriginAllowed({ request, site }: APIContext) {
	if (import.meta.env.MODE === 'development') {
		// Authorize origins in dev mode :
		return true;
	}

	const origin = getOrigin(request);
	if (!origin) return false;

	// Allow requests from same hostname or preview domains :
	const originHostname = new URL(origin).hostname;
	const isFromSameHost = originHostname === site?.hostname;

	// Check if origin is from a preview domain
	const previewDomains = PREVIEW_HOSTS?.split(',').map((d: string) => d.trim()) ?? [];
	const isFromPreviewDomain = previewDomains.some((domain: string) => originHostname.includes(domain));

	return !isFromSameHost && !isFromPreviewDomain;
}

export function getOrigin(request: Request) {
	return request.headers.get('referer') || request.headers.get('origin');
}

export const apiLogger = createLogger('api');
