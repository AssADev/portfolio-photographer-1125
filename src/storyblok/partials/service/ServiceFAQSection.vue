<script setup lang="ts">
import type { StoryblokServiceFAQSection } from '#types/component-types-sb.js';

import ServiceFAQSectionItem from '#storyblok/partials/service/ServiceFAQSectionItem.vue';

// Props :
defineProps<{
	blok: StoryblokServiceFAQSection;
}>();
</script>

<template>
	<div class="partials-service-faq-section">
		<hr
			v-animate="'scale-from-left'"
			class="col-start-1 col-end-13 col-start-tb-1 col-end-tb-17 col-start-dk-1 col-end-dk-33 hide-mobile"
		/>
		<div class="title-wrapper col-start-tb-1 col-end-tb-4 col-start-dk-1 col-end-dk-6">
			<h3 v-animate="'reveal-letters'">{{ blok.title }}</h3>
		</div>
		<div
			class="questions-container col-start-tb-6 col-end-tb-17 col-start-dk-12 col-end-dk-33 col-start-lg-14 col-end-lg-33"
		>
			<ServiceFAQSectionItem v-for="item in blok.questions" :key="item._uid" :blok="item" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-service-faq-section {
	@include mq(tablet) {
		@include grid;
	}

	hr {
		width: 100%;
		height: 1px;
		background: $white;
	}
}

.title-wrapper {
	& > h3 {
		@include roobert-16-uppercase;

		@include mq($until: tablet) {
			margin-block-end: fluidSize(24px, 20px);
		}

		@include mq(tablet) {
			margin-block-start: fluidSize(20px, 18px);
		}
	}
}

.questions-container {
	display: flex;
	flex-direction: column;

	@include mq(tablet) {
		:deep(.partials-service-faq-section-item):first-of-type {
			hr {
				display: none;
			}
		}
	}
}
</style>
