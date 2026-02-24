<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/vue';
import { computed } from 'vue';

import Image from '#components/utils/Image.vue';

import type { StoryblokProject, StoryblokService, StoryblokServicesItem } from '#types/component-types-sb.js';

import vParallax from '#directives/vParallax.ts';
import ServicesProject from '#storyblok/partials/services/ServicesProject.vue';
import ServicesService from '#storyblok/partials/services/ServicesService.vue';

// Props :
const { blok } = defineProps<{
	blok: StoryblokServicesItem;
	numberOfProjects: number;
	serviceStartPrice: number;
}>();

// Refs :
const projects = computed(() => {
	return (blok.projects || []).filter((p): p is ISbStoryData<StoryblokProject> => typeof p !== 'string');
});
const service = computed(() => {
	const s = blok.service[0];
	return s && typeof s !== 'string' ? (s as ISbStoryData<StoryblokService>) : null;
});

const serviceInformations = computed(() => {
	const s = service.value;
	return s ? s.content.informations[0] : null;
});
</script>

<template>
	<section class="modules services-item" :class="{ 'is-reversed': blok.isReversed }">
		<hr v-animate="{ type: 'scale-up', options: { withoutOpacity: true } }" />
		<div class="projects-container">
			<ServicesService
				:url="service!.full_slug"
				:title="serviceInformations!.name"
				:summary="serviceInformations!.summary"
				:is-column="projects.length === 2"
				class="project-wrapper-primary"
				:class="{
					'col-start-dk-1 col-end-dk-23 col-start-mlg-1 col-end-mlg-25':
						!blok.isReversed && projects.length === 1,
					'col-start-dk-1 col-end-dk-17': !blok.isReversed && projects.length === 2,
					'col-start-dk-11 col-end-dk-33 col-start-mlg-9 col-end-mlg-33':
						blok.isReversed && projects.length === 1,
					'col-start-dk-17 col-end-dk-33': blok.isReversed && projects.length === 2
				}"
			>
				<template #image>
					<Image
						v-parallax="6"
						source
						media="tablet"
						:aspect-ratio="projects.length === 2 ? 695 / 720 : 1024 / 720"
						:src="blok.cover"
						:sizes="projects.length === 2 ? [{ desktop: '50vw' }, '100vw'] : [{ desktop: '80vw' }, '100vw']"
					/>
					<Image v-parallax="6" unstyled layout="fullWidth" :aspect-ratio="335 / 438" :src="blok.cover" />
				</template>
				<template #info>
					<div
						class="informations-label"
						v-animate="{ type: 'reveal-button-dot', options: { delay: 0.025 } }"
					>
						<span>{{
							numberOfProjects > 1
								? $t('projectsNumber', { n: numberOfProjects })
								: $t('projectNumber', { n: numberOfProjects })
						}}</span>
					</div>
					<div
						class="informations-label"
						v-animate="{ type: 'reveal-button-dot', options: { delay: 0.175 } }"
					>
						<span>{{ $t('serviceStartPrice', { price: serviceStartPrice }) }}</span>
					</div>
				</template>
			</ServicesService>
			<div
				v-if="projects.length"
				class="project-wrapper-secondary"
				:class="{
					'col-start-dk-23 col-end-dk-33 col-start-mlg-25 col-end-mlg-33':
						!blok.isReversed && projects.length === 1,
					'col-start-dk-17 col-end-dk-33': !blok.isReversed && projects.length === 2,
					'col-start-dk-1 col-end-dk-11 col-start-mlg-1 col-end-mlg-9':
						blok.isReversed && projects.length === 1,
					'col-start-dk-1 col-end-dk-17': blok.isReversed && projects.length === 2
				}"
			>
				<ServicesProject
					v-for="(n, index) in projects.length"
					:key="index"
					:url="projects[index]!.full_slug"
					:title="projects[index].content.informations![0].name"
					:cursor-label="$t('discoverProject')"
					:hover-scale="1.0375"
					:class="{
						'col-start-1 col-end-9 col-start-tb-1 col-end-tb-7':
							(!blok.isReversed && index === 0 && projects.length === 1) ||
							(!blok.isReversed && index === 0 && projects.length === 2),
						'col-start-5 col-end-13 col-start-tb-11 col-end-tb-17':
							(blok.isReversed && index === 0 && projects.length === 1) ||
							(blok.isReversed && index === 1 && projects.length === 2),
						'col-start-5 col-end-13 col-start-tb-5 col-end-tb-11':
							blok.isReversed && index === 0 && projects.length === 2,
						'col-start-1 col-end-9 col-start-tb-7 col-end-tb-13':
							!blok.isReversed && index === 1 && projects.length === 2
					}"
				>
					<template #image>
						<Image
							v-parallax="4"
							source
							media="tablet"
							:aspect-ratio="342 / 284"
							:src="projects[index].content.informations![0].cover"
							:sizes="
								projects.length === 2 ? [{ desktop: '50vw' }, '100vw'] : [{ desktop: '80vw' }, '100vw']
							"
						/>
						<Image
							v-parallax="4"
							unstyled
							layout="fullWidth"
							:aspect-ratio="220 / 328"
							:src="projects[index].content.informations![0].cover"
						/>
					</template>
				</ServicesProject>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.services-item {
	z-index: 1;
	padding-block-end: fluidSize(142px, 96px);

	&.is-reversed {
		.project-wrapper-primary {
			@include mq(desktop) {
				order: 1;
			}
		}

		.project-wrapper-secondary {
			@include mq($from: tablet, $until: desktop) {
				justify-content: flex-end;
			}
		}
	}
}

hr {
	width: var(--ctn-w);
	height: 1px;
	margin-inline: auto;
	background: rgba($khaki, 0.4);
}

.projects-container {
	padding-block-start: fluidSize(60px, 40px);

	@include mq($until: desktop) {
		@include container;

		display: flex;
		flex-direction: column-reverse;
		gap: $gap;
	}

	@include mq(desktop) {
		@include container-grid;

		aspect-ratio: 1440 / 720;
	}
}

.project-wrapper-primary {
	@include mq($until: tablet) {
		aspect-ratio: 335 / 438;
	}

	@include mq($from: tablet, $until: desktop) {
		aspect-ratio: 768 / 540;
	}
}

.project-wrapper-secondary {
	position: relative;
	gap: $gap;

	@include mq($until: desktop) {
		@include grid;
	}

	@include mq(desktop) {
		position: sticky;
		top: 20%;
		display: flex;
		height: fit-content;
		align-items: flex-start;
	}

	.project-container {
		@include mq($until: tablet) {
			aspect-ratio: 220 / 288;
		}

		@include mq(tablet) {
			aspect-ratio: 342 / 254;
		}

		@include mq($from: tablet, $until: desktop) {
			max-width: fluidSize(380px, 320px, null, desktop);
		}
	}
}
</style>
