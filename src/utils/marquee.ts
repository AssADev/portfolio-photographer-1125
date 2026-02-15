import { parseDimensionsFromUrl } from '#utils/image.ts';

export type MarqueeImageOptions = {
	maxWidth?: number;
	maxHeight?: number;
	minScale?: number;
	maxScale?: number;
	roundTo?: number;
};

/**
 * Calculates a deterministic scaled width for an image while respecting max constraints
 * and preserving its original aspect ratio.
 */
export function getMarqueeImageWidth(url: string, options: MarqueeImageOptions = {}): number {
	const { maxWidth = 350, maxHeight = 300, minScale = 0.75, maxScale = 1.0, roundTo = 20 } = options;

	// 1. Get original dimensions :
	const { width, height } = parseDimensionsFromUrl(url);
	const aspectRatio = width / height;

	// 2. Calculate base dimensions respecting max-width and max-height :
	let baseWidth = maxWidth;
	let baseHeight = baseWidth / aspectRatio;

	if (baseHeight > maxHeight) {
		baseHeight = maxHeight;
		baseWidth = baseHeight * aspectRatio;
	}

	// 3. Apply deterministic scale based on the URL :
	let hash = 0;
	for (let i = 0; i < url.length; i++) {
		hash = (hash << 5) - hash + url.charCodeAt(i);
		hash |= 0;
	}
	const deterministicRandom = Math.abs(hash % 1000) / 1000;
	const scale = minScale + deterministicRandom * (maxScale - minScale);
	let finalWidth = baseWidth * scale;

	// 4. Rounding :
	if (roundTo > 0) finalWidth = Math.round(finalWidth / roundTo) * roundTo;

	return finalWidth;
}
