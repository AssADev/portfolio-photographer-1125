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
					' col-start-dk-17 col-end-dk-33': blok.isReversed && Number(blok.projectsNumber) === 3
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
			</div>
		</div>
		<div class="container">
			<div v-if="serviceInformations?.name" class="title-wrapper">
				/<RichText :doc="serviceInformations?.name" />
			</div>
			<p v-if="serviceInformations?.summary" class="summary" v-html="nl2br(serviceInformations?.summary)"></p>
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
	@include mq($until: tablet) {
		@include grid;

		flex-direction: column;
	}

	@include mq(tablet) {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	@include mq(desktop) {
		position: sticky;
		top: 0;
		height: fit-content;
	}

	.project-container {
		@include mq($until: tablet) {
			aspect-ratio: 220 / 288;
		}

		@include mq(tablet) {
			aspect-ratio: 366 / 272;
		}
	}
}

.project-container {
	position: relative;
	display: block;
	overflow: hidden;
	background: grey;
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

.title-wrapper {
	@include roobert-48;

	display: flex;
}

.summary {
	@include roobert-18;
}
</style>
