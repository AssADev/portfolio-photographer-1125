<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/vue';
import { computed } from 'vue';

import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject, StoryblokService, StoryblokServicesHighlight } from '#types/component-types-sb.js';

import vParallax from '#directives/vParallax.ts';

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
			<a :href="service!.full_slug" class="project-container" :data-cursor-label="$t('discoverService')">
				<div class="picture-wrapper">
					<picture>
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
					</picture>
				</div>
				<div class="content-container">
					<div class="name-container">
						<div class="dot-wrapper">
							<Icon name="square-small" />
							<RichText :doc="service!.content.informations![0].name" />
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

.project-container {
	position: relative;
	display: block;
	overflow: hidden;
	width: 100%;
	height: 100%;

	@include hover {
		.picture-wrapper {
			transform: scale3d(1.0125, 1.0125, 1);
		}

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

	.picture-wrapper {
		width: 100%;
		height: 100%;
		transition: transform 0.6s $elasticOut;
	}

	img {
		@include img-fill;
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
</style>
