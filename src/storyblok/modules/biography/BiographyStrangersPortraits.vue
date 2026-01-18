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
const props = defineProps<{
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
const sectionsWrapperRef = useTemplateRef('sectionsWrapperRef');
const circularStarRef = useTemplateRef('circularStarRef');

// Computed :
const explanationIndices = computed(() => {
	let count = 0;
	const indices: Record<string, number> = {};

	props.blok.sections?.forEach((section) => {
		if (section.component.toLowerCase().includes('explanation')) {
			indices[section._uid] = count++;
		}
	});

	return indices;
});

// Methods :
const getScrollAmount = () => {
	if (!sectionsWrapperRef.value || !sectionsContainerRef.value) return 0;
	const totalWidth = sectionsWrapperRef.value.scrollWidth;
	const containerWidth = sectionsContainerRef.value.offsetWidth;

	return Math.max(0, totalWidth - containerWidth);
};

// Animation (Horizontal scroll) :
useGSAP(() => {
	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: sectionsContainerRef.value,
			pin: true,
			scrub: 0.75,
			start: 'center center',
			end: () => `+=${getScrollAmount()}`,
			invalidateOnRefresh: true
		}
	});

	// Horizontal Scroll & Scale Up (Circular Star) :
	tl.to(sectionsWrapperRef.value, { x: () => -getScrollAmount(), ease: 'none' });
	tl.to(circularStarRef.value?.$el, { scale: 1, ease: 'none' }, 0);

	// Move to bottom (Circular Star) :
	// We want the star to move from the center of sectionsContainer to the bottom of the Copyright module.
	const copyrightEl = elRef.value?.querySelector('.modules.biography-copyright') as HTMLElement;

	if (copyrightEl && circularStarRef.value?.$el && sectionsContainerRef.value) {
		gsap.timeline({
			scrollTrigger: {
				trigger: copyrightEl,
				start: 'top bottom',
				end: 'bottom bottom',
				scrub: true,
				invalidateOnRefresh: true
			}
		}).to(circularStarRef.value.$el, {
			y: () => {
				if (!sectionsWrapperRef.value) return 0;

				const halfContainerHeight = sectionsWrapperRef.value.offsetHeight / 2;
				const copyrightHeight = copyrightEl.offsetHeight;

				return halfContainerHeight + copyrightHeight;
			},
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
				:doc="blok.title"
				class="col-start-1 col-end-13 col-start-tb-1 col-end-tb-15 col-start-dk-1 col-end-dk-23 col-start-xlg-1 col-end-xlg-21 col-start-xxlg-1 col-end-xxlg-19"
			/>
		</div>
		<div ref="sectionsContainerRef" class="sections-container">
			<CircularStar ref="circularStarRef" :scroll-speed="0.5" />
			<div ref="sectionsWrapperRef" class="sections-wrapper">
				<StoryblokComponent
					v-for="(section, index) in blok.sections"
					:key="section._uid"
					:components="SectionsComponents"
					:blok="section"
					:index="explanationIndices[section._uid] ?? index"
					:socials="socials"
				/>
			</div>
		</div>

		<BiographyCopyright v-if="blok.copyright?.[0]" :blok="blok.copyright[0]" />
	</section>
</template>

<style lang="scss" scoped>
.biography-strangers-portraits {
	background: linear-gradient(180deg, $white 0%, $ivory 25%, $ivory 75%, $white 100%);
	padding-block-start: fluidSize(160px, 120px);
	overflow: hidden;
}

.container-grid {
	:deep(.partials-rich-text) {
		@include roobert-96;

		position: relative;
		z-index: 2;
		margin-block-end: fluidSize(65px, 48px);

		em {
			@include romie-96-italic;
		}
	}
}

.sections-container {
	position: relative;
	z-index: 1;
	width: 100%;

	@include mq(widescreen) {
		@include container;
	}

	& > :deep(.partials-circular-star) {
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

.sections-wrapper {
	display: flex;
	gap: $gap;
	padding-inline: var(--gutter);
	width: fit-content;
	height: fluidSize(680px, 540px);
	max-height: calc(100svh - (var(--header-height) * 4));
}
</style>
