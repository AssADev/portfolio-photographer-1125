<script setup lang="ts">
import { StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, computed, useTemplateRef } from 'vue';

import LabelShuffle from '#components/partials/LabelShuffle.vue';

import type { StoryblokRichtext } from '#types/component-types-sb.js';

// Props :
const {
	doc,
	resolvers,
	shuffle = false,
	noSnap = false,
	reveal = false,
	prefix = '',
	speed = 'fast'
} = defineProps<{
	doc: StoryblokRichtext;
	resolvers?: Record<string, (node: StoryblokRichTextNode<VNode>) => VNode>;
	shuffle?: boolean;
	noSnap?: boolean;
	reveal?: boolean;
	prefix?: string;
	speed?: 'normal' | 'fast';
}>();

// Refs :
const el = useTemplateRef('el');

// Computed :
const plaintext = computed(() => {
	if (!shuffle || !doc) return '';

	const extractText = (node: any): string => {
		if (node.text) return node.text;
		if (node.content && Array.isArray(node.content)) {
			return node.content.map(extractText).join('');
		}
		return '';
	};

	return extractText(doc);
});

// Resolvers :
const markResolvers = {
	textStyle: (node: any) => {
		const color = node.attrs?.color?.trim();

		if (!color) return node.text;

		return {
			type: 'span',
			attrs: { style: `color:${color}` },
			children: node.text
		};
	}
};

const mergedResolvers = {
	...markResolvers,
	...resolvers
};

// Expose :
defineExpose({ el });
</script>

<template>
	<div ref="el" class="partials-rich-text">
		<span v-if="prefix">{{ prefix }}</span>
		<LabelShuffle v-if="shuffle" :label="plaintext" :no-snap :reveal :speed />
		<StoryblokRichText v-else :doc :resolvers="mergedResolvers" />
	</div>
</template>
