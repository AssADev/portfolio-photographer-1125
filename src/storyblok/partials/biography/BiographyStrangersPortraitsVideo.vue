<script setup lang="ts">
import gsap from 'gsap';

import Video from '#components/partials/Video.vue';

import type { StoryblokBiographyStrangersPortraitsVideo } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokBiographyStrangersPortraitsVideo;
	containerAnimation?: gsap.core.Timeline;
}>();
</script>

<template>
	<Video
		v-animate="{
			type: 'none',
			options: { direction: 'up', containerAnimation }
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
