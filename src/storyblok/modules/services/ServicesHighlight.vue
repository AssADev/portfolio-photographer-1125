<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/vue';
import { computed } from 'vue';

import Image from '#components/utils/Image.vue';

import type { StoryblokProject, StoryblokService, StoryblokServicesHighlight } from '#types/component-types-sb.js';

import vParallax from '#directives/vParallax.ts';
import ServicesService from '#storyblok/partials/services/ServicesService.vue';

// Props :
const { blok } = defineProps<{
	blok: StoryblokServicesHighlight;
	numberOfProjects: number;
	serviceStartPrice: number;
}>();

// Refs :
const project = computed(() => {
	return blok.project?.find((p): p is ISbStoryData<StoryblokProject> => typeof p !== 'string') || null;
});
const service = computed(() => {
	const s = blok.service[0];
	return s && typeof s !== 'string' ? (s as ISbStoryData<StoryblokService>) : null;
});
</script>

<template>
	<section class="modules services-highlight">
		<ServicesService
			:url="service!.full_slug"
			:title="service!.content.informations![0].name"
			:summary="service!.content.informations![0].summary"
			:hover-scale="1.0125"
			:animation-direction="'up'"
		>
			<template #image>
				<Image
					v-parallax="6"
					source
					media="tablet"
					layout="fullWidth"
					:aspect-ratio="1440 / 720"
					:sizes="[{ widescreen: '2560px' }, '100vw']"
					:src="project!.content.informations![0].cover"
				/>
				<Image
					v-parallax="6"
					unstyled
					layout="fullWidth"
					:aspect-ratio="375 / 720"
					:sizes="[{ tablet: '768px' }, '100vw']"
					:src="project!.content.informations![0].cover"
				/>
			</template>
			<template #info>
				<div class="informations-label" v-animate="{ type: 'reveal-button-dot', options: { delay: 0.65 } }">
					<span>{{
						numberOfProjects > 1
							? $t('projectsNumber', { n: numberOfProjects })
							: $t('projectNumber', { n: numberOfProjects })
					}}</span>
				</div>
				<div class="informations-label" v-animate="{ type: 'reveal-button-dot', options: { delay: 0.775 } }">
					<span>{{ $t('serviceStartPrice', { price: serviceStartPrice }) }}</span>
				</div>
			</template>
		</ServicesService>
	</section>
</template>

<style lang="scss" scoped>
.services-highlight {
	height: var(--full-height-without-header);
	overflow: hidden;
}

.container {
	height: 100%;
}
</style>
