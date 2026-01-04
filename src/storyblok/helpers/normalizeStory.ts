/**
 * Recursively adds a leading slash to all 'full_slug' properties in an object.
 * This ensures that links generated from Storyblok stories are always root-relative.
 *
 * @param data - The object or array to normalize
 * @returns The normalized data
 */
export default function normalizeStory<T>(data: T): T {
	if (!data || typeof data !== 'object') return data;

	if (Array.isArray(data)) {
		data.forEach((item) => normalizeStory(item));
		return data;
	}

	const obj = data as any;

	// Add leading slash to full_slug if it exists and doesn't have one :
	if (typeof obj.full_slug === 'string' && obj.full_slug && !obj.full_slug.startsWith('/')) {
		obj.full_slug = '/' + obj.full_slug;
	}

	// Recursively process all properties :
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) normalizeStory(obj[key]);
	}

	return data;
}
