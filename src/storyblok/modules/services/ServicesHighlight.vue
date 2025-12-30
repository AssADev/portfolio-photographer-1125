<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/vue';
import { computed } from 'vue';

import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject, StoryblokService, StoryblokServicesHighlight } from '#types/component-types-sb.js';

import vParallax from '#directives/vParallax.ts';
import ServicesProject from '#storyblok/partials/services/ServicesProject.vue';

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
		<div class="container">
			<ServicesProject
				:url="service!.full_slug"
				:label="service!.content.informations![0].name"
				:cursor-label="$t('discoverService')"
				:hover-scale="1.0125"
			>
				<template #image>
					<Image
						v-parallax="6"
						source
						media="tablet"
						layout="fullWidth"
						:aspect-ratio="1440 / 810"
						:sizes="{ widescreen: '2560px' }"
						:src="project!.content.informations![0].cover"
					/>
					<Image
						v-parallax="6"
						unstyled
						layout="fullWidth"
						:aspect-ratio="375 / 810"
						:sizes="{ tablet: '768px' }"
						:src="project!.content.informations![0].cover"
					/>
				</template>
				<template #info>
					<div class="informations-label">
						<span>{{
							numberOfProjects > 1
								? $t('projectsNumber', { n: numberOfProjects })
								: $t('projectNumber', { n: numberOfProjects })
						}}</span>
					</div>
					<div class="informations-label">
						<span>{{ $t('serviceStartPrice', { price: serviceStartPrice }) }}</span>
					</div>
				</template>
			</ServicesProject>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.services-highlight {
	height: 100vh;
	overflow: hidden;
	height: calc(100vh - (var(--gutter) * 3) - var(--header-height));
}

.container {
	height: 100%;
}
</style>
