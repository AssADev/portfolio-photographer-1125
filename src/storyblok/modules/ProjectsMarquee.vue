<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { useElementSize } from '@vueuse/core';
import { computed, ref } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';
import { getMarqueeImageWidth } from '#utils/marquee.ts';
import { trackFormOpenClick, trackNavigationClick } from '#utils/tracking.ts';

import ProjectsMarqueeItem from '#components/partials/ProjectsMarqueeItem.vue';
import Button from '#components/utils/Button.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import Marquee from '#components/utils/Marquee.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject, StoryblokProjectsMarquee } from '#types/component-types-sb.js';

// Props :
const { projects, excludeUuid } = defineProps<{
	blok: StoryblokProjectsMarquee;
	projects: ISbStoryData<StoryblokProject>[];
	excludeUuid?: string;
}>();

// Variables :
const marqueePlaying = ref(true);
const marqueeRef = ref<HTMLElement | null>(null);

const { height: marqueeHeight } = useElementSize(marqueeRef);

// Computed :
const filteredProjects = computed(() => {
	if (!excludeUuid) return projects;
	return projects.filter((p) => p.uuid !== excludeUuid);
});

const scaledProjects = computed(() => {
	return filteredProjects.value.map((project) => {
		const cover = project.content.informations?.[0]?.coverSmall;
		const url = typeof cover === 'string' ? cover : cover?.filename || '';

		return {
			project,
			width: getMarqueeImageWidth(url)
		};
	});
});
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
					@click="
						blok.link[0].link.component === 'Forms'
							? trackFormOpenClick($event, { formId: (blok.link[0].link.story as any)?.content?.id })
							: trackNavigationClick
					"
				/>
			</div>
		</div>

		<div class="marquee-container" ref="marqueeRef">
			<Marquee
				:speed="40"
				pause-on-hover
				:items="scaledProjects"
				:scroll-speed="0.35"
				align-items="flex-end"
				v-model:playing="marqueePlaying"
			>
				<template #item="{ item }">
					<ProjectsMarqueeItem :project="item.project" :width="item.width" />
				</template>
			</Marquee>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.projects-marquee {
	padding-block-start: fluidSize(142px, 96px);
}

.circular-star-wrapper {
	position: absolute;
	bottom: v-bind("marqueeHeight + 'px'");
	left: 50%;
	transform: translate3d(-50%, 0, 0);
	overflow: hidden;
	pointer-events: none;

	:deep(.partials-circular-star) {
		@include mq($until: desktop) {
			@include svh(125, height);

			transform: translate3d(0, 50%, 0);
		}

		@include mq(desktop) {
			width: var(--ctn-w);
			transform: translate3d(0, 60%, 0);
		}

		@include mq(large) {
			transform: translate3d(0, 67.5%, 0);
		}

		@include mq(xlarge) {
			transform: translate3d(0, 75%, 0);
		}
	}
}

.container-grid {
	z-index: 2;
	margin-block-end: fluidSize(72px, 48px, null, xxlarge);

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
