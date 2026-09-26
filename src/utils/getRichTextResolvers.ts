import type { StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, h } from 'vue';

/**
 * Get the resolvers for the Storyblok RichText component to wrap paragraphs in a specific tag.
 * The paragraph children are already rendered (marks included), so we only need to change the wrapper.
 * @param tag The tag to wrap the paragraphs in.
 */
export const getRichTextResolvers = (tag: string) => {
	return {
		paragraph: (node: StoryblokRichTextNode<VNode>) => h(tag, node.children)
	};
};
