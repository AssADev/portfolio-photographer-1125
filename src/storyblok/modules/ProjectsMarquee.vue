<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { ref } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';

import ProjectsMarqueeItem from '#components/partials/ProjectsMarqueeItem.vue';
import Button from '#components/utils/Button.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import Marquee from '#components/utils/Marquee.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject, StoryblokProjectsMarquee } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokProjectsMarquee;
	projects: ISbStoryData<StoryblokProject>[];
}>();

// Variables :
const marqueePlaying = ref(true);
</script>

<template>
	<section class="modules projects-marquee">
		<div class="circular-star-wrapper">
			<CircularStar :scroll-speed="0.5" />
		</div>
		<div class="container-grid">
			<RichText
				:doc="blok.title"
				class="col-start-1 col-end-13 col-start-tb-1 col-end-tb-12 col-start-dk-20 col-end-dk-33 col-start-xxlg-24 col-end-xxlg-33"
			/>
			<div
				class="description-wrapper col-start-1 col-end-13 col-start-tb-1 col-end-tb-11 col-start-dk-1 col-end-dk-14 col-start-mlg-1 col-end-mlg-12 col-start-xxlg-1 col-end-xxlg-9"
			>
				<p v-if="blok.description" class="description" v-html="blok.description" />
				<Button
					v-if="blok.link?.[0]"
					v-bind="getLinkAttributes(blok.link[0])"
					theme="dot-dark"
					:text="blok.link[0].label || $t('bookYourPhotoSession')"
					:link="blok.link[0].link"
				/>
			</div>
		</div>

		<div class="marquee-container">
			<Marquee
				:speed="40"
				track-visible
				pause-on-hover
				:items="projects"
				:scroll-speed="0.35"
				align-items="flex-end"
				v-model:playing="marqueePlaying"
			>
				<template #item="{ item }">
					<ProjectsMarqueeItem :project="item" />
				</template>
			</Marquee>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.projects-marquee {
	padding-block-start: fluidSize(100px, 80px);
}

.circular-star-wrapper {
	position: absolute;
	bottom: fluidSize(300px, 250px);
	left: 50%;
	transform: translate3d(-50%, 0, 0);
	overflow: hidden;
	pointer-events: none;

	:deep(.partials-circular-star) {
		transform: translate3d(0, 50%, 0);

		@include mq($until: desktop) {
			height: 125vh;
		}

		@include mq(desktop) {
			width: var(--ctn-w);
		}
	}
}

.container-grid {
	z-index: 2;
	margin-block-end: fluidSize(60px, 48px, null, xxlarge);

	& > :deep(.partials-rich-text) {
		@include roobert-48;

		@include mq(desktop) {
			text-align: right;
		}

		em {
			@include romie-48-italic;
		}
	}
}

.description-wrapper {
	display: flex;
	flex-direction: column;
	gap: fluidSize(20px, 16px);

	@include mq($until: desktop) {
		margin-block-start: 14px;
	}

	@include mq(desktop) {
		grid-row: 1;
		padding-block-start: fluidSize(12px, 8px);
	}

	& > p {
		@include roobert-18;
	}
}

.marquee-container {
	@include pseudo-gradient('before', 'top', 'white-ivory-transparent', 1, fluidSize(200px, 160px));

	--marquee-gap: calc(var(--gutter) / 2);

	position: relative;
	z-index: 1;
	display: flex;
	padding-block-start: fluidSize(20px, 16px);
	background: $ivory;

	&::before {
		transform: translate3d(0, -100%, 0);
	}

	:deep(.marquee-wrapper) {
		@include mq(widescreen) {
			@include container;

			mask-image: linear-gradient(
				90deg,
				rgba($white, 0) 0%,
				rgba($white, 1) calc(0% + 420px),
				rgba($white, 1) calc(100% - 420px),
				rgba($white, 0) 100%
			);
		}
	}

	:deep(.marquee-inner) {
		z-index: 1;
	}
}
</style>
