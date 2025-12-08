<script setup lang="ts">
import type { StoryblokBiographyHero } from '#types/component-types-sb.js';

import TitleDescriptionAndCta from '#storyblok/partials/TitleDescriptionAndCta.vue';

const { blok } = defineProps<{
	blok: StoryblokBiographyHero;
}>();

// console.log(blok);
</script>

<template>
	<section class="modules biography-hero">
		<div class="container-grid">
			<h1 class="title col-start-1 col-end-13 col-start-dk-1 col-end-dk-21 col-start-lg-1 col-end-lg-17">
				{{ blok.title }}
			</h1>
			<TitleDescriptionAndCta
				v-if="blok.titleDescriptionAndCta?.[0]"
				:data="blok.titleDescriptionAndCta?.[0]"
				class="col-start-1 col-end-13 col-start-dk-18 col-end-dk-28 col-start-lg-20 col-end-lg-28"
			/>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.biography-hero {
	padding-block-end: fluidSize(100px, 60px);

	@include mq($until: desktop) {
		padding-block-start: 5px;
	}
}

.title {
	@include roobert-96;
}

:deep(.partials-title-description-and-cta) {
	@include mq($until: tablet) {
		max-width: 360px;
	}
}
</style>
