<script setup lang="ts">
import { computed, ref } from 'vue';

import Image from '#components/utils/Image.vue';

import type { StoryblokAsset } from '#types/component-types-sb.js';

// Props :
const { image } = defineProps<{
	x: number;
	y: number;
	rotation: number;
	image?: StoryblokAsset;
}>();

// Refs :
const el = ref<HTMLElement | null>(null);
defineExpose({ el });

// Computed :
const enrichedImage = computed(() => {
	if (!image) return null;
	return {
		...image,
		short_filename: image.filename?.split('/').pop() || 'Image'
	};
});

// Transform the S3 URL to a Storyblok URL :
const transformedSrc = computed(() => {
	if (!image?.filename) return null;

	const url = image.filename;
	if (url.includes('s3.amazonaws.com/a.storyblok.com')) {
		return url.replace('https://s3.amazonaws.com/', 'https://');
	}
	return url;
});
</script>

<template>
	<div
		ref="el"
		class="partials-cursor-projects-item"
		:style="{
			transform: `translate3d(${x}px, ${y}px, 0) scale3d(0, 0, 1)`
		}"
	>
		<div class="inner">
			<Image
				v-if="transformedSrc"
				:src="transformedSrc"
				:aspect-ratio="1"
				:alt="enrichedImage?.alt || enrichedImage?.short_filename"
				:sizes="[{ xxlarge: '225px', desktop: '200px' }, '150px']"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-cursor-projects-item {
	position: absolute;
	transform-origin: 0% 0%;
	transform: scale3d(0, 0, 1);
	will-change: transform, opacity;
}

.inner {
	width: fluidSize(275px, 175px, null, xxlarge);
	height: fluidSize(275px, 175px, null, xxlarge);
	overflow: hidden;
	transform: translate3d(-50%, -50%, 0);

	:deep(img) {
		@include img-fill;
	}
}
</style>
