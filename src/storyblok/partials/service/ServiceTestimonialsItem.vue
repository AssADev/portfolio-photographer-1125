<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { useTemplateRef } from 'vue';

import Icon from '#components/utils/Icon.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokServiceTestimonialsItem } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceTestimonialsItem;
	index: number;
}>();

const emit = defineEmits<{
	hoverChange: [hovered: boolean];
}>();

// Refs :
const rootRef = useTemplateRef('rootRef');

// Decorative hover (testimonials have no focusable content) :
useEventListener(rootRef, 'mouseenter', () => emit('hoverChange', true));
useEventListener(rootRef, 'mouseleave', () => emit('hoverChange', false));
</script>

<template>
	<div ref="rootRef" class="partials-service-testimonials-item">
		<div class="content-container">
			<RichText
				v-animate="{ type: 'reveal-paragraphs', options: { delay: index * 0.125 } }"
				:doc="blok.testimonial"
			/>
			<div v-if="blok.author" class="author-wrapper">
				<Icon
					v-animate="{ type: 'scale-up', options: { delay: 0.1 + index * 0.125, rotate: 90 } }"
					name="square-small"
				/>
				<RichText
					v-animate="{ type: 'reveal-letters', options: { delay: 0.175 + index * 0.125 } }"
					:doc="blok.author"
				/>
			</div>
		</div>
		<hr v-animate="'scale-from-left'" />
	</div>
</template>

<style lang="scss" scoped>
.partials-service-testimonials-item {
	position: relative;
	padding-block-end: fluidSize(72px, 48px);

	hr {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 1px;
		background: rgba($eerieBlack, 0.4);
	}
}

.content-container {
	display: flex;
	flex-direction: column;
	gap: fluidSize(12px, 8px);
	padding-inline-end: fluidSize(160px, 56px, null, widescreen);

	& > :deep(.partials-rich-text) {
		@include roobert-48;

		em {
			@include romie-48-italic;
		}
	}
}

.author-wrapper {
	display: flex;
	gap: fluidSize(8px, 6px);
	align-items: center;
	color: $khaki;

	svg {
		margin-block-start: fluidSize(4px, 2px);
	}

	& > :deep(.partials-rich-text) {
		@include roobert-18;

		em {
			@include romie-18;
		}
	}
}
</style>
