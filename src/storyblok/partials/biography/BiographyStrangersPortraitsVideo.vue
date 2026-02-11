<script setup lang="ts">
import gsap from 'gsap';

import Video from '#components/partials/Video.vue';

import type { StoryblokBiographyStrangersPortraitsVideo } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokBiographyStrangersPortraitsVideo;
	delay: number;
}>();
</script>

<template>
	<Video
		v-animate="{
			type: 'mask-reveal',
			options: { direction: 'right', delay }
		}"
		:video="blok.video"
		:thumbnail="blok.thumbnail"
		:link="blok.link"
		class="partials-biography-strangers-portraits-video"
	/>
</template>

<style lang="scss" scoped>
.partials-biography-strangers-portraits-video {
	flex: 0 0 auto;
	border: 1px solid rgba($eerieBlack, 0.1);
}
</style>
