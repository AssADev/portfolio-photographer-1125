import type { ISbStoryData } from '@storyblok/astro';

import type { StoryblokAsset } from '#types/component-types-sb.js';

interface SitemapImage {
	url: string;
	title?: string;
	caption?: string;
}

/**
 * Sanitizes a filename to be used in alt text.
 * Removes extension, replaces hyphens/underscores with spaces, and capitalizes.
 */
export function sanitizeFilename(filename: string): string {
	if (!filename) return '';
	// Remove URL part if it's a full URL :
	const name = filename.split('/').pop() || filename;
	// Remove extension :
	const nameWithoutExt = name.replace(/\.[^/.]+$/, '');
	// Replace - and _ with spaces, and capitalize each word :
	return nameWithoutExt
		.replace(/[-_]/g, ' ')
		.trim()
		.replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Generates an SEO-friendly alt text for an image based on story metadata.
 */
export function generateAltText(asset: Pick<StoryblokAsset, 'filename'>, story: ISbStoryData): string {
	const storyName = story.name || '';
	const fileName = sanitizeFilename(asset.filename || '');

	// Extract year from slug :
	const slugYear = story.full_slug?.match(/(\d{4})$/)?.[1];
	const date = slugYear ?? (story.created_at ? new Date(story.created_at).getFullYear().toString() : '');

	let location = 'Metz & Nancy, France';
	if (story.content?.informations?.[0]?.location) {
		location = story.content.informations[0].location;
	}

	const parts = [storyName, location, fileName, date].filter(Boolean);
	return parts.join(' - ');
}

/**
 * Recursively extracts images from a Storyblok content object.
 */
function findImages(
	content: unknown,
	story: ISbStoryData,
	images: SitemapImage[] = [],
	visited = new WeakSet<object>()
): SitemapImage[] {
	if (!content || typeof content !== 'object') return images;
	if (visited.has(content)) return images;
	visited.add(content);

	const node = content as Record<string, unknown>;

	if (
		node.filename &&
		typeof node.filename === 'string' &&
		(node.fieldtype === 'asset' || node.filename.includes('a.storyblok.com'))
	) {
		const isImage = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(node.filename);
		if (isImage) {
			const alt = generateAltText({ filename: node.filename }, story);
			images.push({ url: node.filename, title: alt, caption: alt });
		}
	}

	for (const key in node) {
		if (Object.prototype.hasOwnProperty.call(node, key)) {
			findImages(node[key], story, images, visited);
		}
	}

	return images;
}

/**
 * Extracts all images from a story and generates automated alt text for SEO.
 */
export function extractImagesFromStory(story: ISbStoryData): SitemapImage[] {
	if (!story || !story.content) return [];

	const images = findImages(story.content, story);

	// Remove duplicates based on URL :
	return Array.from(new Map(images.map((img) => [img.url, img])).values()).filter((img) => img.url.length > 0);
}
