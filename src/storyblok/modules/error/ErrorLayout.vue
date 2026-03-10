<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/astro';
import { useElementSize } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';

import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { getLinkAttributes } from '#utils/link.ts';
import { getMarqueeImageWidth } from '#utils/marquee.ts';

import ProjectsMarqueeItem from '#components/partials/ProjectsMarqueeItem.vue';
import Button from '#components/utils/Button.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import Icon from '#components/utils/Icon.vue';
import Marquee from '#components/utils/Marquee.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokLabelLink, StoryblokProject, StoryblokRichtext } from '#types/component-types-sb';

// Props :
const { projects } = defineProps<{
	errorTitle: StoryblokRichtext;
	errorLink: StoryblokLabelLink[];
	errorDescription: StoryblokRichtext;
	errorAuthor?: StoryblokRichtext;
	projects: ISbStoryData<StoryblokProject>[];
}>();

// Refs :
const marqueePlaying = ref(true);
const marqueeRef = useTemplateRef('marqueeRef');

const { height: marqueeHeight } = useElementSize(marqueeRef);

// Computed :
const scaledProjects = computed(() => {
	return projects.map((project) => {
		const cover = project.content.informations?.[0]?.coverSmall;
		const url = typeof cover === 'string' ? cover : cover?.filename || '';

		return {
			project,
			width: getMarqueeImageWidth(url)
		};
	});
});

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h1');
</script>

<template>
	<section ref="sectionRef" class="modules error-layout">
		<div class="inner-container">
			<div class="circular-star-wrapper">
				<CircularStar
					v-animate="{ type: 'scale-up', options: { delay: 0.85, reset: true } }"
					:scroll-speed="1"
				/>
			</div>
			<div class="marquee-container" ref="marqueeRef">
				<Marquee
					:speed="40"
					pause-on-hover
					:items="scaledProjects"
					:scroll-speed="0.35"
					align-items="flex-start"
					v-model:playing="marqueePlaying"
				>
					<template #item="{ item, index }">
						<ProjectsMarqueeItem
							v-animate="{
								type: 'mask-reveal',
								options: { direction: 'down', delay: index * 0.125, withTranslate: true }
							}"
							:project="item.project"
							:width="item.width / 1.325"
						/>
					</template>
				</Marquee>
			</div>
			<div class="container">
				<div class="title-container">
					<RichText v-animate="'reveal-titles'" :doc="errorTitle" :resolvers="resolvers" />
					<Button
						v-if="errorLink?.[0]"
						v-animate="{ type: 'reveal-button-dot', options: { delay: 0.25 } }"
						v-bind="getLinkAttributes(errorLink[0].link)"
						theme="dot-dark"
						:text="errorLink[0].label"
						:link="errorLink[0].link"
					/>
				</div>

				<div class="description-container">
					<RichText v-animate="'reveal-paragraphs'" :doc="errorDescription" />
					<div v-if="errorAuthor" class="author-wrapper">
						<Icon v-animate="{ type: 'scale-up', options: { rotate: 90 } }" name="square-small" />
						<RichText
							v-animate="{ type: 'reveal-letters', options: { delay: 0.175 } }"
							:doc="errorAuthor"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.error-layout {
	width: 100%;
	height: 100vh;
	overflow: hidden;
	background: $white;
}

.inner-container {
	height: 100%;
	overflow: hidden;

	& > .container {
		min-height: calc(fluidSize(810px, 780px) - v-bind("marqueeHeight + 'px'"));

		@include mq($until: desktop) {
			padding-block-end: fluidSize(96px, 64px, null, desktop);
		}
	}
}

.circular-star-wrapper {
	position: absolute;
	top: 0;
	left: 50%;
	transform: translate3d(-50%, 0, 0);
	overflow: hidden;
	pointer-events: none;

	:deep(.partials-circular-star) {
		@include mq($until: desktop) {
			@include svh(125, height);
		}

		@include mq($until: large) {
			transform: translate3d(0, -40%, 0);
		}

		@include mq(desktop) {
			width: var(--ctn-w);
		}

		@include mq(large) {
			transform: translate3d(0, -55%, 0);
		}

		@include mq(xlarge) {
			transform: translate3d(0, -60%, 0);
		}
	}
}

.marquee-container {
	@include pseudo-gradient('before', 'bottom', 'ivory-white-transparent', 1, fluidSize(320px, 160px));

	--marquee-gap: calc(var(--gutter) / 2);

	position: relative;
	display: flex;
	padding-block-end: fluidSize(20px, 16px);
	background: $ivory;

	&::before {
		transform: translate3d(0, 100%, 0);
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

	:deep(.picture-wrapper) {
		max-width: 350px;
		max-height: 300px;

		img {
			width: 100%;
			height: auto;
			max-width: inherit;
			max-height: inherit;
		}
	}
}

.container {
	position: absolute;
	z-index: 1;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
}

.title-container {
	position: relative;
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: fluidSize(28px, 24px);
	width: 100%;
	text-align: center;

	& > :deep(.partials-rich-text) {
		@include roobert-96;

		max-width: fluidSize(960px, 420px);
		margin-inline: auto;

		em {
			@include romie-96-italic;
		}
	}

	.partials-button {
		pointer-events: auto;
	}
}

.description-container {
	position: absolute;
	bottom: fluidSize(96px, 84px);
	left: 0;
	display: flex;
	flex-direction: column;
	gap: fluidSize(12px, 8px);

	@include mq($until: desktop) {
		max-width: fluidSize(540px, 360px, null, desktop);
	}

	@include mq(desktop) {
		max-width: fluidSize(720px, 480px);
	}

	& > :deep(.partials-rich-text) {
		@include roobert-28;

		em {
			@include romie-28-italic;
		}
	}
}

.author-wrapper {
	display: flex;
	align-items: center;
	gap: fluidSize(8px, 6px);
	color: $khaki;

	svg {
		margin-block-start: fluidSize(4px, 2px);
	}

	& > :deep(.partials-rich-text) {
		@include roobert-18;

		em {
			@include romie-18;
		}
	}
}
</style>
