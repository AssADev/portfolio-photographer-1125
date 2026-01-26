<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { computed, ref } from 'vue';

import { formatIndex } from '#utils/formatIndex.ts';
import { getAspectRatio } from '#utils/image.ts';

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

const serviceName = computed(() => {
	const service = informations.value?.service?.[0];
	if (service && typeof service !== 'string') {
		return service.content.informations?.[0]?.name;
	}
	return undefined;
});

const aspectRatio = computed(() => {
	return cover.value ? getAspectRatio(cover.value) : undefined;
});
</script>

<template>
	<Button
		class="partials-home-item-project"
		:data-cursor-label="$t('discoverProject')"
		:to="`${project.full_slug}`"
		v-magnetic="{
			strength: 0.1,
			parallax: { target: '.picture-viewer-container', strength: 0.025 }
		}"
	>
		<div class="informations-container">
			<span>{{ formatIndex(index ?? 0) }}</span>
			<RichText v-if="serviceName" :doc="serviceName" />
		</div>
		<div class="picture-viewer-container">
			<div class="picture-container">
				<div class="picture-wrapper" ref="imageRef">
					<Image
						v-if="cover"
						:src="cover"
						object-fit="contain"
						:sizes="[{ widescreen: '2560px' }, '100vw']"
					/>
				</div>
			</div>
		</div>
		<RichText v-if="projectName" :doc="projectName" />
	</Button>
</template>

<style lang="scss" scoped>
.partials-home-item-project {
	position: relative;
}

.picture-container {
	aspect-ratio: v-bind(aspectRatio);

	& > :deep(.picture-wrapper) {
		position: absolute;
		inset: 0;

		img {
			height: 100%;
		}
	}
}
</style>
