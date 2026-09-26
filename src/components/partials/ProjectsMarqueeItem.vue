<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { useDebounceFn } from '@vueuse/core';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

import { isTouchDevice } from '#utils/device.ts';
import { richTextToPlainText } from '#utils/richTextToPlainText.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject } from '#types/component-types-sb.js';

// Props :
const { project, width } = withDefaults(
	defineProps<{
		project: ISbStoryData<StoryblokProject>;
		width?: number;
	}>(),
	{
		width: undefined
	}
);

// Variables :
let tl: gsap.core.Timeline;
let splitTitle: SplitText;
let splitService: SplitText;

const isHovered = ref(false);
// Set after the hydration, so the server & client renders match :
const isTouch = ref(false);

// Refs :
const elRef = useTemplateRef('elRef');
const titleRef = useTemplateRef('titleRef');
const serviceRef = useTemplateRef('serviceRef');

// Computed :
const informations = computed(() => project.content.informations?.[0]);
const service = computed(() => {
	const s = project.content.informations?.[0]?.service?.[0];
	return s && typeof s !== 'string' ? s.content.informations?.[0] : null;
});
const ariaLabel = computed(() => {
	const projectName = richTextToPlainText(informations.value?.name);
	const serviceName = richTextToPlainText(service.value?.name);
	return serviceName ? `${projectName} – ${serviceName}` : projectName;
});

// Animation :
const refreshAnimation = async () => {
	if (!elRef.value || !titleRef.value?.el) return;

	// 1. Cleanup previous splits & timeline :
	tl?.kill();
	splitTitle?.revert();
	splitService?.revert();

	// Wait for layout to be stable :
	await nextTick();

	// 2. Create new splits :
	const titleRoot = titleRef.value!.el as HTMLElement;
	const serviceRoot = serviceRef.value?.el as HTMLElement | undefined;

	const titleEl = titleRoot.querySelector('p') || titleRoot;
	const serviceEl = serviceRoot ? serviceRoot.querySelector('p') || serviceRoot : null;

	// Help GSAP detect lines with <br> tags :
	titleEl.innerHTML = titleEl.innerHTML.replace(/<br\s*\/?>/gi, '\u200B<br>\u200B');

	splitTitle = SplitText.create(titleEl, {
		type: 'lines, words',
		mask: 'lines',
		autoSplit: true
	});
	if (serviceEl) {
		splitService = SplitText.create(serviceEl, {
			type: 'chars',
			autoSplit: true
		});
	}

	// 3. Set initial state :
	gsap.set(splitTitle.lines, { yPercent: 100 });
	if (serviceEl) gsap.set(splitService.chars, { opacity: 0 });

	// 4. Create timeline :
	tl = gsap.timeline({ paused: true });

	tl.to(splitTitle.lines, {
		yPercent: 0,
		duration: 0.6,
		stagger: 0.1,
		ease: 'power2.out'
	});

	if (serviceEl) {
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
				duration: 0.35,
				ease: 'power1.inOut'
			},
			0
		);
	}

	// 5. If we were already hovering during resize, skip to end :
	if (isHovered.value) tl.progress(1);
};

const debounceResize = useDebounceFn(refreshAnimation);

// Events :
const onPointerEnter = () => {
	if (isTouchDevice()) return;
	isHovered.value = true;
	tl?.play();
};

const onPointerLeave = () => {
	if (isTouchDevice()) return;
	isHovered.value = false;
	tl?.reverse();
};

// Attach & Detach :
onMounted(() => {
	isTouch.value = isTouchDevice();
	if (!isTouch.value) refreshAnimation();

	window.addEventListener('resize', debounceResize);
});

onUnmounted(() => {
	tl?.kill();
	splitTitle?.revert();
	splitService?.revert();

	window.removeEventListener('resize', debounceResize);
});
</script>

<template>
	<a
		v-if="informations"
		ref="elRef"
		:href="project.full_slug"
		class="partials-projects-marquee-item"
		:data-cursor-label="$t('discoverProject')"
		:aria-label="ariaLabel"
		@mouseenter="onPointerEnter"
		@mouseleave="onPointerLeave"
		@focusin="onPointerEnter"
		@focusout="onPointerLeave"
		@click="trackNavigationClick"
	>
		<div class="cover-wrapper" :style="width ? { width: `${width}px` } : {}">
			<Image :src="informations.coverMarquee" object-fit="contain" sizes="350px" />
		</div>
		<div v-if="!isTouch" class="content-container">
			<RichText ref="titleRef" class="title" :doc="informations.name" />
			<RichText v-if="service?.name" ref="serviceRef" class="service" :doc="service.name" />
		</div>
	</a>
</template>

<style lang="scss" scoped>
.partials-projects-marquee-item {
	position: relative;
	display: block;
	overflow: hidden;

	@include hover {
		&::before {
			transition: opacity 0.4s $power2Out;
			opacity: 1;
		}

		img {
			transform: scale3d(1.0325, 1.0325, 1);
		}
	}

	&::before {
		content: '';
		position: absolute;
		z-index: 1;
		inset: 0;
		opacity: 0;
		background: radial-gradient(rgba($black, 0) 0%, rgba($black, 0.5) 100%);
		transition: opacity 1.2s $power2Out 0.1s;
	}
}

.cover-wrapper {
	position: relative;
	max-width: 350px;
	max-height: 300px;

	&::before {
		content: '';
		position: absolute;
		z-index: 1;
		inset: 0;
		background: linear-gradient(180deg, rgba($black, 0) 0%, rgba($black, 0.1) 100%);
	}

	img {
		transition: transform 0.6s $power2Out;
	}
}

.content-container {
	position: absolute;
	z-index: 2;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	color: $white;
	padding: var(--gutter);

	:deep(.title) {
		@include roobert-28;

		em {
			@include romie-28-italic;

			display: inline-block;
			white-space: normal;
		}
	}

	:deep(.service) {
		@include roobert-12-uppercase;

		position: absolute;
		bottom: var(--gutter);
		left: 50%;
		transform: translate3d(-50%, 0, 0);
		width: 100%;
	}
}
</style>
