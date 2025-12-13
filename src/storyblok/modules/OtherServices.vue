<script setup lang="ts">
import gsap from 'gsap';
import { useTemplateRef } from 'vue';

import type { StoryblokOtherServices } from '#types/component-types-sb.js';

import { useGSAP } from '#composables/useGSAP.ts';

// Props :
defineProps<{
	blok: StoryblokOtherServices;
}>();

// Refs :
const sectionRef = useTemplateRef<HTMLElement>('sectionRef');
const containerRef = useTemplateRef<HTMLElement>('containerRef');
const titleRef = useTemplateRef<HTMLElement>('titleRef');
const servicesContainerRef = useTemplateRef<HTMLElement>('servicesContainerRef');

const servicesTemp = 4;

// Animation (Horizontal scroll) :
useGSAP(() => {
	if (!servicesContainerRef.value || !containerRef.value || !sectionRef.value) return;

	// Calculate widths :
	const servicesWidth = servicesContainerRef.value.scrollWidth;
	const containerWidth = containerRef.value.offsetWidth;

	// Movement distance: from containerWidth (right) to -(servicesWidth - containerWidth) (left)
	// Total travel = containerWidth + (servicesWidth - containerWidth) = servicesWidth.
	// We want 1px scroll = 1px movement roughly.
	// So duration should be at least servicesWidth.
	// But let's add a minimum to ensure it doesn't feel instant for small content.
	const scrollAmount = Math.max(servicesWidth, containerWidth) + 200;

	console.log(servicesWidth, containerWidth, scrollAmount);

	// Single Timeline for Pinning
	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: sectionRef.value,
			pin: true,
			start: 'center center',
			end: () => `+=${scrollAmount}`,
			scrub: 1,
			invalidateOnRefresh: true
		}
	});

	// Animate Services
	tl.fromTo(servicesContainerRef.value, { x: () => containerWidth }, { x: () => -containerWidth, ease: 'none' }, 0);

	// Animate Title
	tl.fromTo(titleRef.value, { x: '50vw' }, { x: '-50vw', ease: 'none' }, 0);
}, sectionRef);
</script>

<template>
	<section ref="sectionRef" class="modules other-services">
		<div ref="containerRef" class="content-container">
			<h2 ref="titleRef">{{ blok.title }}</h2>
			<div ref="servicesContainerRef" class="services-container">
				<div v-for="i in servicesTemp" :key="i" class="service-wrapper"></div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.other-services {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	min-height: fluidSize(810px, 540px);
	background: linear-gradient(180deg, $white 0%, $ivory 25%, $ivory 75%, $white 100%);
}

.content-container {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;

	@include mq($until: tablet) {
		@include lvh(50, height);

		max-height: 465px;
	}

	@include mq(tablet) {
		aspect-ratio: 16 / 9;
	}

	& > h2 {
		position: absolute;
		margin-top: -0.14em;
		line-height: 1;
		text-wrap: nowrap;
		letter-spacing: -0.02em;
		text-transform: uppercase;
		font-size: clampVw(280px, $min: 140px, $max: 320px, $bp: large);

		@include mq(1920px) {
			font-size: clampVw(540px, $min: 320px, $max: 600px, $bp: widescreen);
		}
	}
}

.services-container {
	position: absolute;
	top: 50%;
	transform: translate3d(0, -50%, 0);
	display: flex;
	column-gap: 320px;
	height: calc(335px * 2 + 5%);
}

.service-wrapper {
	width: 275px;
	height: 335px;
	aspect-ratio: 275 / 335;
	background: grey;
	box-shadow: 30px 30px 60px rgba($eerieBlack, 0.15);
	overflow: hidden;
	flex-shrink: 0;

	&:nth-child(odd) {
		align-self: flex-start;
	}

	&:nth-child(even) {
		align-self: flex-end;
	}
}
</style>
