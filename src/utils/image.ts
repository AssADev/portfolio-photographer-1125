import { getBreakpoints as getUnpicBreakpoints } from '@unpic/core/base';
import type { ImageProps as UnpicImageBaseProps } from '@unpic/vue/base';
import { SITE_URL } from 'astro:env/client';
import type { Operations, TransformerFunction } from 'unpic';
import { type StoryblokOperations, transform as sbTransform } from 'unpic/providers/storyblok';
import type { ImgHTMLAttributes, SourceHTMLAttributes } from 'vue';

import { type BreakpointKey, type Breakpoints, breakpoints, mapSortBreakpoints } from '#utils/breakpoints';

import type { StoryblokAsset } from '#types/component-types-sb.js';

export type ImgSize = string | Partial<Breakpoints> | [Partial<Breakpoints>, string?];

export type UnpicSBImageBaseProps = UnpicImageBaseProps<StoryblokOperations, undefined>;

export type CommonImageProps<TOperations extends Operations = Operations> = {
	width?: number;
	height?: number;
	layout?: 'fixed' | 'constrained' | 'fullWidth';
	priority?: boolean;
	background?: string;
	aspectRatio?: number;
	operations?: TOperations;
	objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'inherit' | 'initial';
	unstyled?: boolean;
	/**
	 * If true, if the image is a svg, it will serve an img tag with the svg as a mask
	 * and the currentColor as the background-color. This allows to emulate the svg
	 * inheriting the `color` prop as if it was inline.
	 */
	maskSrc?: boolean;
	/**
	 * If true, the rendered node will be a source to be used in a picture tag.
	 */
	source?: boolean;
	/**
	 * Only when source is true.
	 */
	media?: string;
	blur?: boolean;
};

export type SourceBaseProps<TOperations extends Operations = Operations> = {
	width?: number;
	height?: number;
	layout?: 'fixed' | 'constrained' | 'fullWidth';
	aspectRatio?: number;
	src: string;
	media?: string;
	transformer: TransformerFunction<TOperations, undefined>;
} & /* @vue-ignore */ SourceHTMLAttributes;

export type ImageBaseProps<TOperations extends Operations = Operations> = CommonImageProps<TOperations> & {
	alt: string;
	src: string;
	transformer: TransformerFunction<TOperations, undefined>;
} & /* @vue-ignore */ Omit<ImgHTMLAttributes, 'alt'>;

export type ImageProps = CommonImageProps<StoryblokOperations> & {
	// props from Storyblok
	sizes?: ImgSize;
	alt?: string | null;
	src: string | StoryblokAsset;
} & /* @vue-ignore */ Omit<ImgHTMLAttributes, 'src' | 'sizes' | 'alt'>;

const ALL_RESOLUTIONS = [
	320, // old small phones with density 1.0
	640, // older and lower-end phones
	750, // iPhone 6-8
	960, // older horizontal phones
	1080, // iPhone 6-8 Plus
	1280, // 720p
	1668, // Various iPads
	1920, // 1080p
	2048 // QXGA
	// 3840, // 4K
	// 3200, // QHD+
	// 2560, // WQXGA
];

export function parseSizesFromBreakpoints(sizes: ImgSize) {
	if (typeof sizes === 'string') return sizes;

	const sizesArray = Array.isArray(sizes) ? sizes : [sizes];
	const [bp, defaultSize = '100vw'] = sizesArray;
	const mappedSize = Object.entries(bp).reduce(
		(acc, [key, value]) => {
			const breakpoint = breakpoints[key as BreakpointKey];
			if (!breakpoint) {
				throw new Error(`[Image] Invalid breakpoint key: ${key}`);
			}
			return { ...acc, [value]: breakpoint };
		},
		{} as Record<number, string>
	);

	const sortedSizes = mapSortBreakpoints(mappedSize);
	return sortedSizes.map(([size, bp]) => `(min-width: ${bp}px) ${size}`).join(', ') + `, ${defaultSize}`;
}

export function parseDimensionsFromUrl(url: string) {
	const [width, height] = (url.split('/')[5] ?? '').split('x');
	return { width: Number(width), height: Number(height) };
}

// Grid configuration (see `src/styles/tools/_grid.scss`) :
const GRID_BREAKPOINTS = [
	{ key: '', minWidth: 0, columns: 12 },
	{ key: 'tb', minWidth: 768, columns: 16 },
	{ key: 'dk', minWidth: 1024, columns: 32 },
	{ key: 'mlg', minWidth: 1280, columns: 32 },
	{ key: 'lg', minWidth: 1440, columns: 32 },
	{ key: 'xlg', minWidth: 1680, columns: 32 },
	{ key: 'xxlg', minWidth: 1920, columns: 32 },
	{ key: 'wd', minWidth: 2560, columns: 32 }
];

const GRID_MAX_WIDTH = 2560;

/**
 * Build the `sizes` attribute of an image from the grid classes of its container
 * (e.g. `col-start-1 col-end-13 col-start-dk-3 col-end-dk-16`), so the browser doesn't load
 * a full width image for an element which only takes a part of the screen.
 */
export function getGridSizes(classes: string | string[] = []) {
	const list = Array.isArray(classes) ? classes : classes.split(/\s+/);
	const sizes: string[] = [];

	let start = 1;
	let end: number | undefined;
	let span: number | undefined;

	for (const { key, minWidth, columns } of GRID_BREAKPOINTS) {
		const infix = key ? `-${key}` : '';
		const find = (prefix: string) => {
			const match = list.map((c) => c.match(new RegExp(`^${prefix}${infix}-(\\d+)$`))).find(Boolean);
			return match ? Number(match[1]) : undefined;
		};

		// Values cascade from the smaller breakpoints (like the CSS classes) :
		start = find('col-start') ?? start;
		end = find('col-end') ?? end;
		span = find('col') ?? span;

		const columnsCount = Math.min(columns, span ?? (end ? end - start : columns));
		const ratio = Math.max(0, Math.min(1, columnsCount / columns));

		sizes.unshift(
			minWidth >= GRID_MAX_WIDTH
				? `(min-width: ${minWidth}px) ${Math.ceil(ratio * GRID_MAX_WIDTH)}px`
				: `${minWidth ? `(min-width: ${minWidth}px) ` : ''}${Math.ceil(ratio * 100)}vw`
		);
	}

	// Remove the consecutive duplicates (the smaller breakpoint is enough) :
	return sizes
		.filter(
			(size, index) =>
				size.replace(/^\(min-width: \d+px\) /, '') !== sizes[index + 1]?.replace(/^\(min-width: \d+px\) /, '')
		)
		.join(', ');
}

// We need to override the transform function to add the height so that Storyblok can
// properly perform the transforms
export const transform: (props: ImageProps, blur?: boolean) => typeof sbTransform = (props, blur) => (src, options) => {
	const _src = String(src);
	if (_src.endsWith('.svg')) return _src;

	if (!options.height && options.width && props.aspectRatio) {
		options.height = Math.round(Number(options.width) / props.aspectRatio);
	}

	options.filters = Object.assign({}, { quality: 75 }, options.filters);

	const url = sbTransform(src, options);
	if (blur) return new URL('/api/blur.webp?url=' + encodeURIComponent(url), SITE_URL).href;

	return url;
};

type BindType = Omit<UnpicSBImageBaseProps, 'transformer' | 'width' | 'height'> & {
	width?: number;
	height?: number;
	breakpoints: number[];
};

export const parseImageData = (props: ImageProps, resolutions?: number[]) => {
	const { src, alt, operations, sizes, ...rest } = props;

	const data: Partial<StoryblokAsset> = typeof src === 'string' ? { filename: src } : src;

	const bind = { ...rest, src: data.filename || data.src || '' } as BindType;

	if (bind.src.endsWith('.svg')) {
		return { bind };
	}

	const mergedOperations = operations || {};

	if (data?.focus) {
		mergedOperations.filters = mergedOperations.filters || {};
		mergedOperations.filters.focal ||= data.focus;
	}

	if (sizes) bind.sizes = parseSizesFromBreakpoints(sizes);

	bind.breakpoints =
		resolutions ??
		(props.width
			? getUnpicBreakpoints({
					width: props.width,
					layout: props.layout || 'constrained',
					resolutions: ALL_RESOLUTIONS
				})
			: ALL_RESOLUTIONS);

	return {
		bind,
		operations: mergedOperations
	};
};

export const parseMedia = (media?: string) => {
	if (!media || media.startsWith('(')) return media;
	const bp = breakpoints[media as BreakpointKey];

	return `(min-width: ${bp})`;
};

export const getAspectRatio = (src: string | StoryblokAsset) => {
	const url = typeof src === 'string' ? src : src.filename;
	if (!url || !url.includes('a.storyblok.com')) return undefined;

	try {
		const { width, height } = parseDimensionsFromUrl(url);
		if (width && height) return width / height;
	} catch (e) {
		return undefined;
	}

	return undefined;
};
