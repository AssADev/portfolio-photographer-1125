<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { computed, ref } from 'vue';

import { formatIndex } from '#utils/formatIndex.ts';
import { getAspectRatio } from '#utils/image.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject } from '#types/component-types-sb.js';

import vMagnetic from '#directives/vMagnetic.ts';

// Props :
const { project, index } = defineProps<{
	project: ISbStoryData<StoryblokProject>;
	index?: number;
}>();

// Computed :
const informations = computed(() => project.content.informations?.[0]);
const cover = computed(() => informations.value?.cover);
const projectName = computed(() => informations.value?.name);

const service = computed(() => {
	const service = informations.value?.service?.[0];
	if (service && typeof service !== 'string') {
		return service;
	}
	return undefined;
});

const aspectRatio = computed(() => {
	return cover.value ? getAspectRatio(cover.value) : undefined;
});
</script>

<template>
	<div
		class="partials-home-item-project"
		v-magnetic="{
			strength: 0.1,
			parallax: { target: 'img', strength: 0.025 }
		}"
	>
		<div class="informations-container">
			<span v-animate="{ type: 'reveal-letters', options: { delay: 0.2 } }">/{{ formatIndex(index ?? 0) }}</span>
			<Button v-if="service" :to="`${service?.full_slug}`" data-cursor-snap @click="trackNavigationClick">
				<RichText
					v-animate="{ type: 'reveal-label-shuffle', options: { delay: 0.2 } }"
					:doc="service.content.informations?.[0]?.name"
					shuffle
					reveal
				/>
			</Button>
		</div>
		<Button class="project-link" :data-cursor-label="$t('discoverProject')" :to="`${project.full_slug}`">
			<div class="picture-container">
				<div
					v-animate="{ type: 'mask-reveal', options: { direction: 'down', start: 'top 120%' } }"
					class="picture-wrapper"
				>
					<Image
						v-if="cover"
						:src="cover"
						object-fit="contain"
						:sizes="[{ widescreen: '2560px' }, '100vw']"
					/>
				</div>
			</div>
			<div class="title-container">
				<RichText
					v-if="projectName"
					v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.2 } }"
					:doc="projectName"
				/>
			</div>
		</Button>
	</div>
</template>

<style lang="scss" scoped>
.partials-home-item-project {
	position: relative;
}

.project-link {
	display: block;
	width: 100%;
}

.informations-container {
	@include roobert-14-uppercase;

	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: fluidSize(20px, 16px);
	margin-block-end: fluidSize(10px, 8px);
}

.picture-container {
	position: relative;
	aspect-ratio: v-bind(aspectRatio);
	overflow: hidden;

	& > :deep(.picture-wrapper) {
		position: absolute;
		inset: 0;

		img {
			height: 100%;
			transform: scale3d(1.025, 1.025, 1);
		}
	}
}

.title-container {
	& > :deep(.partials-rich-text) {
		@include roobert-48;

		em {
			@include romie-48-italic;
		}
	}
}
</style>
