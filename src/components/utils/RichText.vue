<script setup lang="ts">
import { StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, computed, useTemplateRef } from 'vue';

import LabelShuffle from '#components/partials/LabelShuffle.vue';

import type { StoryblokRichtext } from '#types/component-types-sb.js';

// Props :
const {
	doc,
	resolvers,
	shuffle = false
} = defineProps<{
	doc: StoryblokRichtext;
	resolvers?: Record<string, (node: StoryblokRichTextNode<VNode>) => VNode>;
	shuffle?: boolean;
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

defineExpose({ el });
</script>

<template>
	<div ref="el" class="partials-rich-text">
		<LabelShuffle v-if="shuffle" :label="plaintext" />
		<StoryblokRichText v-else :doc :resolvers />
	</div>
</template>
