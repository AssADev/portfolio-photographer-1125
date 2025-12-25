<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { computed, useTemplateRef } from 'vue';

import { parseDimensionsFromUrl } from '#utils/image.ts';

import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject } from '#types/component-types-sb.js';

import { useGSAP } from '#composables/useGSAP.ts';

// Props :
const { project } = defineProps<{ project: ISbStoryData<StoryblokProject> }>();

// Refs :
const elRef = useTemplateRef('elRef');
const titleRef = useTemplateRef('titleRef');
const serviceRef = useTemplateRef('serviceRef');

// Variables :
let tl: gsap.core.Timeline;

const informations = computed(() => project.content.informations?.[0]);
const service = computed(() => project.content.informations?.[0].service?.[0].content.informations?.[0]);

const aspectRatio = computed(() => {
	const src = informations.value?.cover;
	if (!src) return undefined;

	const url = typeof src === 'string' ? src : src.filename;
	if (!url || !url.includes('a.storyblok.com')) return undefined;

	try {
		const { width, height } = parseDimensionsFromUrl(url);
		if (width && height) return width / height;
	} catch (e) {
		return undefined;
	}

	return undefined;
});

// Animation :
useGSAP(() => {
	if (!elRef.value || !titleRef.value?.el || !serviceRef.value?.el) return;

	// const splitTitle = SplitText.create(titleRef.value!.el, {
	// 	type: 'words',
	// 	mask: 'words',
	// 	autoSplit: true
	// });
	const splitTitle = SplitText.create(titleRef.value!.el, {
		type: 'lines',
		mask: 'lines',
		autoSplit: true
	});
	const splitService = SplitText.create(serviceRef.value!.el, {
		type: 'chars',
		// mask: 'chars',
		autoSplit: true
	});

	// // Manual mask for lines :
	// splitTitle.lines.forEach((line) => {
	// 	const wrapper = document.createElement('div');
	// 	wrapper.style.overflow = 'hidden';
	// 	line.parentNode?.insertBefore(wrapper, line);
	// 	wrapper.appendChild(line);
	// });

	// Set initial state :
	gsap.set(splitTitle.lines, { yPercent: 100 });
	// gsap.set(splitTitle.words, { yPercent: 100 });
	// gsap.set(splitService.chars, { y: 20, opacity: 0 });
	gsap.set(splitService.chars, { opacity: 0 });

	// Animation :
	tl = gsap.timeline({ paused: true });

	// tl.to(splitTitle.words, {
	// 	yPercent: 0,
	// 	duration: 0.6,
	// 	// stagger: 0.1,
	// 	ease: 'power2.out'
	// });

	tl.to(splitTitle.lines, {
		yPercent: 0,
		duration: 0.6,
		stagger: 0.1,
		ease: 'power2.out'
	});

	tl.to(
		splitService.chars,
		{
			y: 0,
			opacity: 1,
			stagger: {
				from: 'center',
				grid: 'auto',
				each: 0.02
			},
			duration: 0.3,
			ease: 'power2.out'
		},
		0
	);
}, elRef);
</script>

<template>
	<a
		ref="elRef"
		v-if="informations"
		:href="project.full_slug"
		class="partials-projects-marquee-item"
		:data-cursor-label="$t('discoverProject')"
		@mouseenter="tl?.play()"
		@mouseleave="tl?.reverse()"
	>
		<div class="cover-wrapper">
			<Image :src="informations.coverSmall" object-fit="contain" />
		</div>
		<div class="content-container">
			<RichText ref="titleRef" class="title" :doc="informations.name" />
			<RichText ref="serviceRef" class="service" :doc="service.name" />
		</div>
	</a>
</template>

<style lang="scss" scoped>
.partials-projects-marquee-item {
	position: relative;
	display: block;
	// width: fit-content;
	overflow: hidden;

	@include hover {
		&::before {
			transition: transform 0.4s $power2Out;
			transform: translate3d(-50%, 0, 0) scale3d(1, 1, 1);
		}

		img {
			transform: scale3d(1.0325, 1.0325, 1);
		}
	}

	&::before {
		content: '';
		position: absolute;
		z-index: 1;
		width: 2px;
		height: calc(var(--gutter) / 1.5);
		background: $white;
		bottom: 0;
		left: 50%;
		transform-origin: bottom center;
		transition: transform 0.4s $power2InOut;
		transform: translate3d(-50%, 0, 0) scale3d(1, 0, 1);
	}
}

.cover-wrapper {
	position: relative;
	max-width: 350px;
	max-height: 300px;
	// aspect-ratio: v-bind(aspectRatio);

	&::before {
		content: '';
		position: absolute;
		z-index: 1;
		inset: 0;
		background: linear-gradient(180deg, rgba($black, 0) 0%, rgba($black, 0.1) 100%);
	}

	img {
		transition: transform 0.6s $elasticOut;
		max-height: inherit;
	}
}

.content-container {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	color: $white;
	padding: var(--gutter);

	:deep(.title) {
		@include roobert-36;

		em {
			@include romie-36-italic;

			display: inline-block;
			white-space: normal;
		}
	}

	:deep(.service) {
		@include roobert-14-uppercase;

		position: absolute;
		bottom: var(--gutter);
		left: 50%;
		transform: translate3d(-50%, 0, 0);
		width: 100%;
	}
}
</style>
