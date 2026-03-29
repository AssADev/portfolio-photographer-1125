<script setup lang="ts">
import gsap from 'gsap';
import { computed, useTemplateRef } from 'vue';

import CircularStar from '#components/utils/CircularStar.vue';
import RichText from '#components/utils/RichText.vue';
import StoryblokComponent from '#components/utils/StoryblokComponent.vue';

import type { StoryblokBiographyStrangersPortraits, StoryblokLabelLink } from '#types/component-types-sb.js';

import { useGSAP } from '#composables/useGSAP.ts';
import BiographyCopyright from '#storyblok/modules/biography/BiographyCopyright.vue';
import BiographyStrangersPortraitsExplanation from '#storyblok/partials/biography/BiographyStrangersPortraitsExplanation.vue';
import BiographyStrangersPortraitsVideo from '#storyblok/partials/biography/BiographyStrangersPortraitsVideo.vue';

// Props :
const { blok } = defineProps<{
	blok: StoryblokBiographyStrangersPortraits;
	socials: StoryblokLabelLink[];
}>();

// Components :
const SectionsComponents = {
	BiographyStrangersPortraitsExplanation,
	BiographyStrangersPortraitsVideo
};

// Refs :
const elRef = useTemplateRef('elRef');
const sectionsContainerRef = useTemplateRef('sectionsContainerRef');
const sectionsStickyContainerRef = useTemplateRef('sectionsStickyContainerRef');
const sectionsWrapperRef = useTemplateRef('sectionsWrapperRef');
const circularStarRef = useTemplateRef('circularStarRef');

// Computed :
const explanationIndices = computed(() => {
	let count = 0;
	const indices: Record<string, number> = {};

	blok.sections?.forEach((section) => {
		if (section.component.toLowerCase().includes('explanation')) {
			indices[section._uid] = count++;
		}
	});

	return indices;
});

const sectionHeight = computed(() => {
	let total = 0;

	blok.sections?.forEach((section) => {
		const component = section.component.toLowerCase();
		if (component.includes('video')) total += 25;
		if (component.includes('explanation')) total += 50;
	});

	return `calc(100vh + ${total}vh)`;
});

// Methods :
const getScrollAmount = () => {
	if (!sectionsWrapperRef.value || !sectionsStickyContainerRef.value) return 0;
	const totalWidth = sectionsWrapperRef.value.scrollWidth;
	const containerWidth = sectionsStickyContainerRef.value.offsetWidth;

	return Math.max(0, totalWidth - containerWidth);
};

// Animation (Horizontal scroll) :
useGSAP(() => {
	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: sectionsStickyContainerRef.value,
			start: 'center center',
			endTrigger: sectionsContainerRef.value,
			end: 'bottom bottom',
			scrub: 1,
			invalidateOnRefresh: true
		}
	});

	// Horizontal Scroll & Scale Up (Circular Star) :
	tl.to(sectionsWrapperRef.value, { x: () => -getScrollAmount(), ease: 'none' });
	tl.to(circularStarRef.value?.$el, { scale: 1, yPercent: -50, ease: 'none' }, 0);

	// Move to bottom (Circular Star) :
	// We want the star to move from the center of sectionsContainer to the bottom of the Copyright module.
	const copyrightEl = elRef.value?.querySelector('.modules.biography-copyright') as HTMLElement;

	if (copyrightEl && circularStarRef.value?.$el) {
		gsap.timeline({
			scrollTrigger: {
				trigger: copyrightEl,
				start: 'top bottom',
				end: 'bottom bottom',
				scrub: 1,
				invalidateOnRefresh: true
			}
		}).to(circularStarRef.value?.$el, {
			y: () => window.innerHeight * 0.5,
			yPercent: -50,
			ease: 'none'
		});
	}
}, elRef);
</script>

<template>
	<section ref="elRef" class="modules biography-strangers-portraits">
		<div class="container-grid">
			<RichText
				v-animate="'reveal-titles'"
				:doc="blok.title"
				class="col-start-1 col-end-13 col-start-tb-1 col-end-tb-15 col-start-dk-1 col-end-dk-23 col-start-xlg-1 col-end-xlg-21 col-start-xxlg-1 col-end-xxlg-19"
			/>
		</div>

		<div class="circular-star-container">
			<div class="circular-star-wrapper">
				<div class="circular-star-inner">
					<CircularStar ref="circularStarRef" :scroll-speed="0.5" />
				</div>
			</div>
		</div>

		<div ref="sectionsContainerRef" class="sections-container" :style="{ height: sectionHeight }">
			<div ref="sectionsStickyContainerRef" class="sections-sticky-container">
				<div ref="sectionsWrapperRef" class="sections-wrapper">
					<StoryblokComponent
						v-for="(section, index) in blok.sections"
						:key="section._uid"
						:components="SectionsComponents"
						:blok="section"
						:delay="index * 0.1"
						:index="explanationIndices[section._uid] ?? index"
						:socials="socials"
					/>
				</div>
			</div>
		</div>

		<BiographyCopyright v-if="blok.copyright?.[0]" :blok="blok.copyright[0]" />
	</section>
</template>

<style lang="scss" scoped>
$sectionsHeight: fluidSize(680px, 540px);

.biography-strangers-portraits {
	background: linear-gradient(
		180deg,
		rgba($white, 0) 0%,
		rgba($ivory, 1) 25%,
		rgba($ivory, 1) 75%,
		rgba($white, 0) 100%
	);
	padding-block-start: fluidSize(180px, 120px);
}

.circular-star-container {
	position: absolute;
	inset: 0;
	pointer-events: none;

	.circular-star-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.circular-star-inner {
		position: sticky;
		top: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	:deep(.partials-circular-star) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate3d(-50%, -50%, 0) scale3d(0, 0, 1);

		@include mq($until: desktop) {
			@include svh(125, height);
		}

		@include mq(desktop) {
			width: var(--ctn-w);
		}
	}
}

.container-grid {
	:deep(.partials-rich-text) {
		@include roobert-96;

		text-wrap: balance;
		margin-block-end: fluidSize(65px, 48px);

		em {
			@include romie-96-italic;
		}
	}
}

.sections-container {
	position: relative;
	z-index: 1;
}

.sections-sticky-container {
	position: sticky;
	top: calc(50% - (#{$sectionsHeight} / 2));
	width: 100%;
	display: flex;
	align-items: center;
	overflow: hidden;

	@include mq(widescreen) {
		@include container;
	}
}

.sections-wrapper {
	display: flex;
	gap: $gap;
	width: fit-content;
	height: $sectionsHeight;
	max-height: calc(100svh - (var(--header-height) * 4));
	padding-inline: var(--gutter);
}
</style>
