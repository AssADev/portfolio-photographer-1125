import type { StoryblokRichtext } from '#types/component-types-sb.js';

// Nodes whose children are inline (their texts must be joined without spaces) :
const INLINE_CONTAINERS = ['paragraph', 'heading'];

/**
 * Extract the text of a Storyblok rich text (e.g. for the meta tags or the structured data).
 */
export const richTextToPlainText = (doc?: StoryblokRichtext | string | null): string => {
	if (!doc) return '';
	if (typeof doc === 'string') return doc.trim();

	const walk = (node: StoryblokRichtext): string => {
		if (node.type === 'text') return node.text ?? '';
		if (node.type === 'hard_break') return ' ';

		return (node.content ?? []).map(walk).join(INLINE_CONTAINERS.includes(node.type) ? '' : ' ');
	};

	return walk(doc).replace(/\s+/g, ' ').trim();
};
