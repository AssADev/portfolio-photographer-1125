<script setup lang="ts">
import Icon from '#components/utils/Icon.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProjectTestimonial } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokProjectTestimonial;
}>();
</script>

<template>
	<section class="modules project-testimonial">
		<div class="container-grid">
			<div
				class="testimonial-wrapper col-start-2 col-end-13 col-start-tb-3 col-end-tb-14 col-start-dk-8 col-end-dk-30 col-start-lg-8 col-end-lg-29 col-start-xlg-9 col-end-xlg-27 col-start-xxlg-10 col-end-xxlg-26 col-start-wd-11 col-end-wd-25"
			>
				<RichText :doc="blok.testimonial" />
				<div class="author-wrapper">
					<Icon name="square-small" />
					<RichText :doc="blok.author" />
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.project-testimonial {
	padding-block: fluidSize(112px, 72px);
}

.testimonial-wrapper {
	display: flex;
	flex-direction: column;
	gap: fluidSize(16px, 12px);

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
