<script setup lang="ts">
import { computed, ref } from 'vue';

import { getAspectRatio } from '#utils/image.ts';

import Button from '#components/utils/Button.vue';
import Image from '#components/utils/Image.vue';

import type { StoryblokProjectItemPicture } from '#types/component-types-sb.js';

import vMagnetic from '#directives/vMagnetic.ts';
import { openMinimap } from '#stores/project.ts';

// Props :
const { blok, index } = defineProps<{
	blok: StoryblokProjectItemPicture;
	index?: number;
}>();

// Refs :
const imageRef = ref<HTMLElement | null>(null);

// Computed :
const aspectRatio = computed(() => getAspectRatio(blok.picture));

// Methods :
const onOpenMinimap = () => {
	if (!imageRef.value || typeof index === 'undefined') return;

	openMinimap(index, imageRef.value);
};
</script>

<template>
	<Button
		v-animate="{ type: 'mask-reveal', options: { direction: 'down' } }"
		class="partials-project-item-picture"
		:data-cursor-label="$t('scaleUp')"
		@click="onOpenMinimap"
		v-magnetic="{
			strength: 0.1,
			parallax: { target: '.picture-viewer-container', strength: 0.025 }
		}"
	>
		<div class="picture-viewer-container">
			<div class="picture-container">
				<div class="picture-wrapper" ref="imageRef">
					<Image :src="blok.picture" object-fit="contain" :sizes="[{ widescreen: '2560px' }, '100vw']" />
				</div>
			</div>
		</div>
	</Button>
</template>

<style lang="scss" scoped>
.partials-project-item-picture {
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
