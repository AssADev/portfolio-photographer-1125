<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { computed } from 'vue';

import { parseDimensionsFromUrl } from '#utils/image.ts';

import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject } from '#types/component-types-sb.js';

// Props :
const { project } = defineProps<{ project: ISbStoryData<StoryblokProject> }>();

// Variables :
const informations = computed(() => project.content.informations?.[0]);

const aspectRatio = computed(() => {
	const src = informations.value?.cover;
	if (!src) return undefined;

	const url = typeof src === 'string' ? src : src.filename;
	if (!url || !url.includes('a.storyblok.com')) return undefined;

	try {
		const { width, height } = parseDimensionsFromUrl(url);
		if (width && height) return width / height;
	} catch (e) {
		return undefined;
	}

	return undefined;
});
</script>

<template>
	<a
		v-if="informations"
		:href="project.full_slug"
		class="partials-marquee-item"
		:data-cursor-label="$t('discoverProject')"
	>
		<div class="cover-wrapper">
			<Image :src="informations.coverSmall" object-fit="contain" />
		</div>
		<div class="content-container">
			<RichText :doc="informations.name" />
		</div>
	</a>
</template>

<style lang="scss" scoped>
.partials-marquee-item {
	position: relative;
	display: block;
	// width: fit-content;
	overflow: hidden;

	@include hover {
		img {
			transform: scale3d(1.0325, 1.0325, 1);
		}
	}
}

.cover-wrapper {
	position: relative;
	max-width: 350px;
	max-height: 300px;
	// aspect-ratio: v-bind(aspectRatio);

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba($black, 0) 0%, rgba($black, 0.1) 100%);
	}

	img {
		transition: transform 0.6s $elasticOut;
		max-height: inherit;
	}
}

.content-container {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	color: $white;
	// mix-blend-mode: difference;
	padding: fluidSize(20px, 16px);

	& > :deep(.partials-rich-text) {
		@include roobert-36;

		em {
			@include romie-36-italic;
		}
	}
}
</style>
