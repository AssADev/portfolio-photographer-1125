import { StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, h } from 'vue';

/**
 * Get the resolvers for the Storyblok RichText component to wrap paragraphs in a specific tag.
 * @param tag The tag to wrap the paragraphs in.
 */
export const getRichTextResolvers = (tag: string) => {
	return {
		paragraph: (node: StoryblokRichTextNode<VNode>) =>
			h(tag, h(StoryblokRichText, { doc: { type: 'doc', content: node.content } }))
	};
};
