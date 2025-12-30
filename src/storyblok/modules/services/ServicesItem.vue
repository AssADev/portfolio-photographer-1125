<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/vue';
import { computed } from 'vue';

import { nl2br } from '#utils/nl2br.ts';

import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject, StoryblokService, StoryblokServicesItem } from '#types/component-types-sb.js';

import vParallax from '#directives/vParallax.ts';

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
				<a :href="projects[0]?.full_slug" class="project-container" :data-cursor-label="$t('discoverProject')">
					<div class="picture-wrapper">
						<picture>
							<Image
								v-parallax="6"
								source
								media="tablet"
								:aspect-ratio="projects.length === 3 ? 695 / 628 : 1024 / 628"
								:src="projects[0].content.informations![0].cover"
								:sizes="
									projects.length === 3
										? [{ desktop: '50vw' }, '100vw']
										: [{ desktop: '80vw' }, '100vw']
								"
							/>
							<Image
								v-parallax="6"
								unstyled
								layout="fullWidth"
								:aspect-ratio="335 / 438"
								:src="projects[0].content.informations![0].cover"
							/>
						</picture>
					</div>
					<div class="content-container">
						<div class="name-container">
							<div class="dot-wrapper">
								<Icon name="square-small" />
								<RichText :doc="projects[0].content.informations![0].name" />
								<Icon name="square-small" />
							</div>
						</div>
						<div class="informations-wrapper">
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
						</div>
					</div>
				</a>
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
				<a
					v-for="(n, index) in projects.length - 1"
					:key="index"
					:href="projects[index + 1]?.full_slug"
					class="project-container"
					:class="{
						'col-start-1 col-end-9': !blok.isReversed,
						'col-start-5 col-end-13': blok.isReversed
					}"
					:data-cursor-label="$t('discoverProject')"
				>
					<div class="picture-wrapper">
						<picture>
							<Image
								v-parallax="4"
								source
								media="tablet"
								:aspect-ratio="342 / 284"
								:src="projects[index + 1].content.informations![0].cover"
								:sizes="
									projects.length === 3
										? [{ desktop: '50vw' }, '100vw']
										: [{ desktop: '80vw' }, '100vw']
								"
							/>
							<Image
								v-parallax="4"
								unstyled
								layout="fullWidth"
								:aspect-ratio="220 / 328"
								:src="projects[index + 1].content.informations![0].cover"
							/>
						</picture>
					</div>
					<div class="content-container">
						<div class="name-container">
							<div class="dot-wrapper">
								<Icon name="square-small" />
								<RichText :doc="projects[index + 1].content.informations![0].name" />
								<Icon name="square-small" />
							</div>
						</div>
					</div>
				</a>
				<a
					v-if="serviceInformations?.name && projects.length === 3"
					:href="service?.full_slug"
					class="title-wrapper hide-mobile-tablet"
					:class="{
						reversed: blok.isReversed
					}"
				>
					/<RichText :doc="serviceInformations?.name" />
				</a>
			</div>
		</div>
		<a :href="service?.full_slug" class="service-informations-container">
			<div
				v-if="serviceInformations?.name"
				class="title-wrapper"
				:class="{
					'col-start-tb-1 col-end-tb-10 col-start-dk-1 col-end-dk-12':
						!blok.isReversed && projects.length === 2,
					'col-start-tb-1 col-end-tb-10 col-start-dk-11 col-end-dk-23 col-start-mlg-9 col-end-mlg-21 col-start-xlg-9 col-end-xlg-20 col-start-xxlg-9 col-end-xxlg-19':
						blok.isReversed && projects.length === 2,
					'col-start-tb-1 col-end-tb-10 hide-desktop': projects.length === 3
				}"
			>
				/<RichText :doc="serviceInformations?.name" />
			</div>
			<p
				v-if="serviceInformations?.summary"
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
				v-html="nl2br(serviceInformations?.summary)"
			></p>
		</a>
	</section>
</template>

<style lang="scss" scoped>
.services-item {
	z-index: 1;
	padding-block-end: fluidSize(100px, 80px);

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
		gap: 10px;
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

	.project-container {
		height: 100%;

		@include hover {
			.picture-wrapper {
				transform: scale3d(1.0175, 1.0175, 1);
			}
		}
	}
}

.project-wrapper-secondary {
	position: relative;

	@include mq($until: tablet) {
		@include grid;

		row-gap: 10px;
	}

	@include mq(tablet) {
		display: flex;
		gap: 10px;
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

		@include hover {
			.picture-wrapper {
				transform: scale3d(1.0375, 1.0375, 1);
			}
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

.project-container {
	position: relative;
	display: block;
	overflow: hidden;
	width: 100%;

	.picture-wrapper {
		transition: transform 0.6s $elasticOut;
	}

	@include hover {
		.content-container .name-container {
			:deep(.partials-rich-text) {
				transform: translate3d(-10px, 0, 0);
			}

			svg {
				&:first-of-type {
					transform: translate3d(0, -50%, 0) scale3d(0, 0, 0) rotate(90deg);
					transition: transform 0.4s $power2Out;
				}

				&:last-of-type {
					transform: translate3d(0, -50%, 0) scale3d(1, 1, 1);
					transition: transform 0.4s $elasticOut 0.2s;
				}
			}
		}
	}
}

.content-container {
	position: absolute;
	bottom: 0;
	left: 0;
	display: flex;
	gap: 10px;
	width: 100%;
	padding: 20px;

	@include mq($until: tablet) {
		flex-direction: column;
	}

	@include mq(tablet) {
		align-items: center;
		justify-content: space-between;
	}
}

.name-container {
	position: relative;
	border-radius: 3px;
	color: $eerieBlack;
	background: $whiteChoco;
	padding: 5px 8px fluidSize(7px, 6px) 18px;
	overflow: hidden;
	width: fit-content;

	.dot-wrapper {
		display: flex;

		:deep(.partials-rich-text) {
			@include roobert-14-uppercase;

			text-wrap: nowrap;
			transition: transform 0.4s $power2Out 0.1s;
		}

		svg {
			position: absolute;

			&:first-of-type {
				left: 8px;
				top: 50%;
				transform: translate3d(0, -50%, 0);
				transition: transform 0.4s $elasticOut 0.2s;
			}

			&:last-of-type {
				right: 8px;
				top: 50%;
				transform: translate3d(0, -50%, 0) scale3d(0, 0, 0) rotate(90deg);
				transition: transform 0.4s $power2Out;
			}
		}
	}
}

.informations-wrapper {
	display: flex;
	align-items: center;
	gap: 10px;
}

.informations-label {
	position: relative;
	border-radius: 3px;
	color: $white;
	background: $eerieBlack;
	padding: 5px 8px fluidSize(7px, 6px);
	overflow: hidden;

	span {
		@include roobert-14-uppercase;

		display: flex;
		text-wrap: nowrap;
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
