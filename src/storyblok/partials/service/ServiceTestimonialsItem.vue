<script setup lang="ts">
import Icon from '#components/utils/Icon.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokServiceTestimonialsItem } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceTestimonialsItem;
	index: number;
}>();

const emit = defineEmits<{
	mouseenter: [];
	mouseleave: [];
}>();
</script>

<template>
	<div class="partials-service-testimonials-item" @mouseenter="emit('mouseenter')" @mouseleave="emit('mouseleave')">
		<div class="content-container">
			<RichText
				v-animate="{ type: 'reveal-paragraphs', options: { delay: index * 0.125 } }"
				:doc="blok.testimonial"
			/>
			<div v-if="blok.author" class="author-wrapper">
				<Icon
					v-animate="{ type: 'scale-up', options: { delay: index * 0.125, rotate: 90 } }"
					name="square-small"
				/>
				<RichText
					v-animate="{ type: 'reveal-letters', options: { delay: 0.175 + index * 0.125 } }"
					:doc="blok.author"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-service-testimonials-item {
	border-bottom: 1px solid rgba($eerieBlack, 0.4);
	padding-block-end: fluidSize(72px, 48px);
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
	align-items: center;
	gap: fluidSize(8px, 6px);
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
