<script setup lang="ts">
import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { getLinkAttributes } from '#utils/link.ts';
import { nl2br } from '#utils/nl2br.ts';
import { trackFormOpenClick, trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokTitleDescriptionAndCta } from '#types/component-types-sb.js';

// Props :
const { data } = defineProps<{
	data: StoryblokTitleDescriptionAndCta;
}>();

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h2');
</script>

<template>
	<div class="partials-title-description-and-cta">
		<RichText v-animate="'reveal-titles'" v-if="data.title?.content" :doc="data.title" :resolvers="resolvers" />
		<p
			v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.125 } }"
			v-if="data.description"
			v-html="nl2br(data.description)"
		/>
		<Button
			v-if="data.cta?.[0]"
			v-bind="getLinkAttributes(data.cta[0])"
			theme="dot-dark"
			:text="data.cta[0].label"
			:link="data.cta[0].link"
			@click="
				data.cta[0].link.component === 'Forms'
					? trackFormOpenClick($event, { formId: (data.cta[0].link.story as any)?.content?.id })
					: trackNavigationClick
			"
		/>
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
