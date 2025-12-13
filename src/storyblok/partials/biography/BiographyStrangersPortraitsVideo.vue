<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';

import Button from '#components/utils/Button.vue';

import type { StoryblokBiographyStrangersPortraitsVideo } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokBiographyStrangersPortraitsVideo;
}>();

// Refs :
const videoRef = useTemplateRef<HTMLVideoElement>('videoRef');

// Variables :
let observer: IntersectionObserver | null = null;

// Methods :
const playVideo = () => {
	if (!videoRef.value) return;
	videoRef.value.play();
};

const pauseVideo = () => {
	if (!videoRef.value) return;
	videoRef.value?.pause();
};

const createObserver = () => {
	if (!videoRef.value) return;

	observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				entry.isIntersecting ? playVideo() : pauseVideo();
			});
		},
		{
			root: null,
			rootMargin: '0px',
			threshold: 0
		}
	);

	observer.observe(videoRef.value);
};

// Attach :
onMounted(() => {
	createObserver();
});

onUnmounted(() => {
	observer?.disconnect();
});
</script>

<template>
	<Button
		v-if="blok.thumbnail.filename && blok.video.filename"
		is="a"
		v-bind="getLinkAttributes(blok.link)"
		class="partials-biography-strangers-portraits-video"
	>
		<video
			ref="videoRef"
			:poster="blok.thumbnail.filename"
			:src="blok.video.filename"
			loop
			muted
			playsinline
		></video>
	</Button>
</template>

<style lang="scss" scoped>
.partials-biography-strangers-portraits-video {
	position: relative;
	flex: 0 0 auto;
	aspect-ratio: 350 / 620;
	overflow: hidden;
	border: 1px solid rgba($eerieBlack, 0.1);
}

video {
	@include img-fill;
}
</style>
