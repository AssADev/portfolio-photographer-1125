<script setup lang="ts">
import { computed } from 'vue';

import { nl2br } from '#utils/nl2br.ts';

import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokServicesItem } from '#types/component-types-sb.js';

// Props :
const { blok } = defineProps<{
	blok: StoryblokServicesItem;
}>();

// Refs :
const service = computed(() => blok.service[0]);
const serviceInformations = computed(() => {
	const s = service.value;
	if (s && typeof s !== 'string') return s.content.informations[0];
	return null;
});

// Variables :
const numberOfProjects = 58;
const serviceStartPrice = 80;
</script>

<template>
	<section class="modules services-item" :class="{ 'is-reversed': blok.isReversed }">
		<div class="projects-container">
			<div
				class="project-wrapper-primary"
				:class="{
					'col-start-dk-1 col-end-dk-23 col-start-mlg-1 col-end-mlg-25':
						!blok.isReversed && Number(blok.projectsNumber) === 2,
					'col-start-dk-1 col-end-dk-17': !blok.isReversed && Number(blok.projectsNumber) === 3,
					'col-start-dk-11 col-end-dk-33 col-start-mlg-9 col-end-mlg-33':
						blok.isReversed && Number(blok.projectsNumber) === 2,
					'col-start-dk-17 col-end-dk-33': blok.isReversed && Number(blok.projectsNumber) === 3
				}"
			>
				<a :href="service.full_slug" class="project-container">
					<div class="content-container">
						<p class="label">Lorem Ipsum</p>
						<div class="informations-wrapper">
							<span>{{
								numberOfProjects > 1
									? $t('projectsNumber', { n: numberOfProjects })
									: $t('projectNumber', { n: numberOfProjects })
							}}</span>
							<span>{{ $t('serviceStartPrice', { price: serviceStartPrice }) }}</span>
						</div>
					</div>
				</a>
			</div>
			<div
				v-if="Number(blok.projectsNumber) > 1"
				class="project-wrapper-secondary"
				:class="{
					'col-start-dk-23 col-end-dk-33 col-start-mlg-25 col-end-mlg-33':
						!blok.isReversed && Number(blok.projectsNumber) === 2,
					'col-start-dk-17 col-end-dk-33': !blok.isReversed && Number(blok.projectsNumber) === 3,
					'col-start-dk-1 col-end-dk-11 col-start-mlg-1 col-end-mlg-9':
						blok.isReversed && Number(blok.projectsNumber) === 2,
					'col-start-dk-1 col-end-dk-17': blok.isReversed && Number(blok.projectsNumber) === 3
				}"
			>
				<a
					v-for="(n, index) in Number(blok.projectsNumber) - 1"
					:key="index"
					:href="service.full_slug"
					class="project-container"
					:class="{
						'col-start-1 col-end-9': !blok.isReversed,
						'col-start-5 col-end-13': blok.isReversed
					}"
				>
					<div class="content-container">
						<p class="label">Lorem Ipsum</p>
					</div>
				</a>
				<div
					v-if="serviceInformations?.name && Number(blok.projectsNumber) === 3"
					class="title-wrapper hide-mobile-tablet"
					:class="{
						reversed: blok.isReversed
					}"
				>
					/<RichText :doc="serviceInformations?.name" />
				</div>
			</div>
		</div>
		<div class="service-informations-container">
			<div
				v-if="serviceInformations?.name"
				class="title-wrapper"
				:class="{
					'col-start-tb-1 col-end-tb-10 col-start-dk-1 col-end-dk-12':
						!blok.isReversed && Number(blok.projectsNumber) === 2,
					'col-start-tb-1 col-end-tb-10 col-start-dk-11 col-end-dk-23 col-start-mlg-9 col-end-mlg-21 col-start-xlg-9 col-end-xlg-20 col-start-xxlg-9 col-end-xxlg-19':
						blok.isReversed && Number(blok.projectsNumber) === 2,
					'col-start-tb-1 col-end-tb-10 hide-desktop': Number(blok.projectsNumber) === 3
				}"
			>
				/<RichText :doc="serviceInformations?.name" />
			</div>
			<p
				v-if="serviceInformations?.summary"
				class="summary"
				:class="{
					'col-start-tb-10 col-end-tb-16 col-start-dk-12 col-end-dk-21 col-start-mlg-12 col-end-mlg-19 col-start-xlg-13 col-end-xlg-20 col-start-xxlg-13 col-end-xxlg-19':
						!blok.isReversed && Number(blok.projectsNumber) === 2,
					'col-start-tb-10 col-end-tb-16 col-start-dk-1 col-end-dk-10':
						!blok.isReversed && Number(blok.projectsNumber) === 3,
					'col-start-tb-10 col-end-tb-16 col-start-dk-23 col-end-dk-33 col-start-mlg-22 col-end-mlg-30 col-start-xlg-22 col-end-xlg-29 col-start-xxlg-21 col-end-xxlg-28':
						blok.isReversed && Number(blok.projectsNumber) === 2,
					'col-start-tb-10 col-end-tb-16 col-start-dk-17 col-end-dk-27':
						blok.isReversed && Number(blok.projectsNumber) === 3
				}"
				v-html="nl2br(serviceInformations?.summary)"
			></p>
		</div>
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

		aspect-ratio: 1440 / 680;
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
			aspect-ratio: 366 / 272;
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

.project-container {
	position: relative;
	display: block;
	overflow: hidden;
	border: 1px solid red;
	width: 100%;
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

.informations-wrapper {
	display: flex;
	align-items: center;
	gap: 10px;
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
