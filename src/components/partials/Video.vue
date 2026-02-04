<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';

import type { StoryblokAsset } from '#types/component-types-sb.js';

// Props :
defineProps<{
	video: StoryblokAsset;
	thumbnail: StoryblokAsset;
	link?: any;
}>();

// Refs :
const videoRef = useTemplateRef('videoRef');

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
		v-if="thumbnail.filename && video.filename"
		is="a"
		v-bind="getLinkAttributes(link)"
		:aria-label="$t('watchVideo')"
		:data-cursor-label="$t('watchVideo')"
		class="partials-video"
		@click="trackNavigationClick"
	>
		<video ref="videoRef" :poster="thumbnail.filename" :src="video.filename" loop muted playsinline></video>
	</Button>
</template>

<style lang="scss" scoped>
.partials-video {
	position: relative;
	display: block;
	aspect-ratio: 350 / 620;
	overflow: hidden;
}

video {
	@include img-fill;
}
</style>
