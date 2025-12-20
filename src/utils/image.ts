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
	const [width, height] = url.split('/')[5].split('x');
	return { width: Number(width), height: Number(height) };
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
