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
		<div class="container">
			<TitleDescriptionAndCta v-if="blok.titleDescriptionAndCta?.[0]" :data="blok.titleDescriptionAndCta?.[0]" />
		</div>
	</section>
</template>

<style lang="scss" scoped>
.biography-hero {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
