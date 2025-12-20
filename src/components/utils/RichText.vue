<script setup lang="ts">
import { StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, useTemplateRef } from 'vue';

import type { StoryblokRichtext } from '#types/component-types-sb.js';

// Props :
const { doc, resolvers } = defineProps<{
	doc: StoryblokRichtext;
	resolvers?: Record<string, (node: StoryblokRichTextNode<VNode>) => VNode>;
}>();

// Refs :
const element = useTemplateRef('element');

defineExpose({ element });
</script>

<template>
	<div ref="element" class="partials-rich-text">
		<StoryblokRichText :doc :resolvers />
	</div>
</template>
