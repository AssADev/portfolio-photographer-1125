<script setup lang="ts">
import { StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, h } from 'vue';

import { nl2br } from '#utils/nl2br.ts';

import Button from '#components/utils/Button.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokTitleDescriptionAndCta } from '#types/component-types-sb.js';

const { data } = defineProps<{
	data: StoryblokTitleDescriptionAndCta;
}>();

const resolvers = {
	paragraph: (node: StoryblokRichTextNode<VNode>) =>
		h('h2', h(StoryblokRichText, { doc: { type: 'doc', content: node.content } }))
};
</script>

<template>
	<div class="partials-title-description-and-cta">
		<RichText v-if="data.title?.content" :doc="data.title" :resolvers="resolvers" />
		<p v-if="data.description" v-html="nl2br(data.description)" />
		<Button v-if="data.cta?.[0]" theme="dot-dark" :text="data.cta[0].label" :link="data.cta[0].link" />
	</div>
</template>

<style lang="scss" scoped>
.partials-title-description-and-cta {
	& > :deep(.partials-rich-text) {
		@include roobert-48;

		margin-block-end: fluidSize(28px, 20px);

		em {
			@include romie-48-italic;
		}
	}

	& > p {
		@include roobert-18;
	}

	& > :deep(.partials-button) {
		margin-block-start: fluidSize(18px, 16px);
	}
}
</style>
