<script setup lang="ts">
import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { nl2br } from '#utils/nl2br.ts';

import RichText from '#components/utils/RichText.vue';

import type { StoryblokRichtext } from '#types/component-types-sb.js';

// Props :
defineProps<{
	title?: StoryblokRichtext;
	description?: string;
}>();

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h2');
</script>

<template>
	<div class="partials-title-description">
		<RichText v-if="title" :doc="title" :resolvers="resolvers" />
		<p v-if="description" v-html="nl2br(description)" />
	</div>
</template>

<style lang="scss" scoped>
.partials-title-description {
	display: flex;
	flex-direction: column;
	gap: fluidSize(12px, 10px);
	margin-block-end: fluidSize(48px, 36px);

	& > :deep(.partials-rich-text) {
		@include roobert-48;

		em {
			@include romie-48-italic;
		}
	}

	& > p {
		@include roobert-18;

		max-width: fluidSize(540px, 360px);
	}
}
</style>
