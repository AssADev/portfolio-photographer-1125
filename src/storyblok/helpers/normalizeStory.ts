import { generateAltText } from './extractImagesFromStory';

/**
 * Recursively adds a leading slash to all 'full_slug' properties in an object.
 * Also automatically fills missing image alt tags with metadata (name, location, date).
 *
 * @param data - The object or array to normalize
 * @param rootStory - Internal use for recursion
 * @returns The normalized data
 */
export default function normalizeStory<T>(data: T, rootStory?: any): T {
	if (!data || typeof data !== 'object') return data;

	if (Array.isArray(data)) {
		data.forEach((item) => normalizeStory(item, rootStory));
		return data;
	}

	const obj = data as any;

	// If we detect a Story object (it has a content property and a name property) :
	let currentRoot = rootStory;
	if (obj.content && obj.name) {
		currentRoot = obj;
	}

	// Add leading slash to full_slug if it exists and doesn't have one :
	if (typeof obj.full_slug === 'string' && obj.full_slug && !obj.full_slug.startsWith('/')) {
		obj.full_slug = '/' + obj.full_slug;
	}

	// Automate missing alt text for image assets :
	if (
		currentRoot &&
		obj.filename &&
		typeof obj.filename === 'string' &&
		(obj.fieldtype === 'asset' || obj.filename.includes('a.storyblok.com'))
	) {
		const isImage = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(obj.filename);
		if (isImage && !obj.alt) {
			obj.alt = generateAltText(obj, currentRoot);
		}
	}

	// Recursively process all properties :
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			normalizeStory(obj[key], currentRoot);
		}
	}

	return data;
}
