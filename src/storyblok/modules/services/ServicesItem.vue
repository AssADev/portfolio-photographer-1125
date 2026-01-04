<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/vue';
import { computed } from 'vue';

import { nl2br } from '#utils/nl2br.ts';

import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject, StoryblokService, StoryblokServicesItem } from '#types/component-types-sb.js';

import vParallax from '#directives/vParallax.ts';
import ServicesProject from '#storyblok/partials/services/ServicesProject.vue';

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
		<div class="projects-container">
			<div
				class="project-wrapper-primary"
				:class="{
					'col-start-dk-1 col-end-dk-23 col-start-mlg-1 col-end-mlg-25':
						!blok.isReversed && projects.length === 2,
					'col-start-dk-1 col-end-dk-17': !blok.isReversed && projects.length === 3,
					'col-start-dk-11 col-end-dk-33 col-start-mlg-9 col-end-mlg-33':
						blok.isReversed && projects.length === 2,
					'col-start-dk-17 col-end-dk-33': blok.isReversed && projects.length === 3
				}"
			>
				<ServicesProject
					:url="projects[0]!.full_slug"
					:label="projects[0].content.informations![0].name"
					:cursor-label="$t('discoverProject')"
				>
					<template #image>
						<Image
							v-parallax="6"
							source
							media="tablet"
							:aspect-ratio="projects.length === 3 ? 695 / 628 : 1024 / 628"
							:src="projects[0].content.informations![0].cover"
							:sizes="
								projects.length === 3 ? [{ desktop: '50vw' }, '100vw'] : [{ desktop: '80vw' }, '100vw']
							"
						/>
						<Image
							v-parallax="6"
							unstyled
							layout="fullWidth"
							:aspect-ratio="335 / 438"
							:src="projects[0].content.informations![0].cover"
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
			<div
				v-if="projects.length > 1"
				class="project-wrapper-secondary"
				:class="{
					'col-start-dk-23 col-end-dk-33 col-start-mlg-25 col-end-mlg-33':
						!blok.isReversed && projects.length === 2,
					'col-start-dk-17 col-end-dk-33': !blok.isReversed && projects.length === 3,
					'col-start-dk-1 col-end-dk-11 col-start-mlg-1 col-end-mlg-9':
						blok.isReversed && projects.length === 2,
					'col-start-dk-1 col-end-dk-17': blok.isReversed && projects.length === 3
				}"
			>
				<ServicesProject
					v-for="(n, index) in projects.length - 1"
					:key="index"
					:url="projects[index + 1]!.full_slug"
					:label="projects[index + 1].content.informations![0].name"
					:cursor-label="$t('discoverProject')"
					:hover-scale="1.0375"
					:class="{
						'col-start-1 col-end-9': !blok.isReversed,
						'col-start-5 col-end-13': blok.isReversed
					}"
				>
					<template #image>
						<Image
							v-parallax="4"
							source
							media="tablet"
							:aspect-ratio="342 / 284"
							:src="projects[index + 1].content.informations![0].cover"
							:sizes="
								projects.length === 3 ? [{ desktop: '50vw' }, '100vw'] : [{ desktop: '80vw' }, '100vw']
							"
						/>
						<Image
							v-parallax="4"
							unstyled
							layout="fullWidth"
							:aspect-ratio="220 / 328"
							:src="projects[index + 1].content.informations![0].cover"
						/>
					</template>
				</ServicesProject>
				<a
					v-if="projects.length === 3"
					:href="service!.full_slug"
					class="title-wrapper hide-mobile-tablet"
					:class="{
						reversed: blok.isReversed
					}"
				>
					/<RichText :doc="serviceInformations!.name" />
				</a>
			</div>
		</div>
		<a :href="service!.full_slug" class="service-informations-container">
			<div
				class="title-wrapper"
				:class="{
					'col-start-tb-1 col-end-tb-10 col-start-dk-1 col-end-dk-12':
						!blok.isReversed && projects.length === 2,
					'col-start-tb-1 col-end-tb-10 col-start-dk-11 col-end-dk-23 col-start-mlg-9 col-end-mlg-21 col-start-xlg-9 col-end-xlg-20 col-start-xxlg-9 col-end-xxlg-19':
						blok.isReversed && projects.length === 2,
					'col-start-tb-1 col-end-tb-10 hide-desktop': projects.length === 3
				}"
			>
				/<RichText :doc="serviceInformations!.name" />
			</div>
			<p
				class="summary"
				:class="{
					'col-start-tb-10 col-end-tb-16 col-start-dk-12 col-end-dk-21 col-start-mlg-12 col-end-mlg-19 col-start-xlg-13 col-end-xlg-20 col-start-xxlg-13 col-end-xxlg-19':
						!blok.isReversed && projects.length === 2,
					'col-start-tb-10 col-end-tb-16 col-start-dk-1 col-end-dk-10':
						!blok.isReversed && projects.length === 3,
					'col-start-tb-10 col-end-tb-16 col-start-dk-23 col-end-dk-33 col-start-mlg-22 col-end-mlg-30 col-start-xlg-22 col-end-xlg-29 col-start-xxlg-21 col-end-xxlg-28':
						blok.isReversed && projects.length === 2,
					'col-start-tb-10 col-end-tb-16 col-start-dk-17 col-end-dk-27':
						blok.isReversed && projects.length === 3
				}"
				v-html="nl2br(serviceInformations!.summary)"
			></p>
		</a>
	</section>
</template>

<style lang="scss" scoped>
.services-item {
	z-index: 1;
	padding-block-end: fluidSize(128px, 96px);

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

.projects-container {
	border-top: 1px solid rgba($khaki, 0.4);
	padding-block-start: fluidSize(60px, 40px);

	@include mq($until: desktop) {
		@include container;

		display: flex;
		flex-direction: column-reverse;
		gap: $gap;
	}

	@include mq(desktop) {
		@include container-grid;

		aspect-ratio: 1440 / 628;
	}
}

.project-wrapper-primary {
	width: 100%;
	height: 100%;

	@include mq($until: tablet) {
		aspect-ratio: 335 / 438;
	}

	@include mq($from: tablet, $until: desktop) {
		aspect-ratio: 768 / 540;
	}
}

.project-wrapper-secondary {
	position: relative;

	@include mq($until: tablet) {
		@include grid;

		row-gap: $gap;
	}

	@include mq(tablet) {
		display: flex;
		gap: $gap;
	}

	@include mq(desktop) {
		position: sticky;
		top: 20%;
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

	.title-wrapper {
		position: absolute;
		bottom: 0;
		transform: translate3d(0, calc(100% + 2px), 0);

		&:not(.reversed) {
			left: 0;
		}

		&.reversed {
			left: 50%;
		}
	}
}

.service-informations-container {
	margin-block-start: fluidSize(12px, 10px);

	@include mq($until: tablet) {
		@include container;

		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	@include mq(tablet) {
		@include container-grid;
	}
}

.title-wrapper {
	@include roobert-48;

	display: flex;
}

.summary {
	@include roobert-18;

	max-width: fluidSize(460px, 320px, null, widescreen);

	@include mq(tablet) {
		margin-block-start: 2px;
	}
}
</style>
