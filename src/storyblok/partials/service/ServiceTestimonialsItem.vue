<script setup lang="ts">
import Icon from '#components/utils/Icon.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokServiceTestimonialsItem } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceTestimonialsItem;
}>();
</script>

<template>
	<div class="partials-service-testimonials-item">
		<div class="content-container">
			<RichText :doc="blok.testimonial" />
			<div v-if="blok.author" class="author-wrapper">
				<Icon name="square-small" />
				<RichText :doc="blok.author" />
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
