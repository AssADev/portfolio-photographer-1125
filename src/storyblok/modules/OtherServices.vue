<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTemplateRef } from 'vue';

import { breakPointsNoUnits } from '#utils/breakpoints.ts';

import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokOtherServices, StoryblokService } from '#types/component-types-sb.js';

import { useGSAP } from '#composables/useGSAP.ts';
import vMagnetic from '#directives/vMagnetic.ts';

// Props :
defineProps<{
	blok: StoryblokOtherServices;
	services: ISbStoryData<StoryblokService>[];
}>();

// Refs :
const sectionRef = useTemplateRef<HTMLElement>('sectionRef');
const containerRef = useTemplateRef<HTMLElement>('containerRef');
const titleRef = useTemplateRef<HTMLElement>('titleRef');
const servicesContainerRef = useTemplateRef<HTMLElement>('servicesContainerRef');

// Animation (Horizontal scroll) :
useGSAP(() => {
	if (!servicesContainerRef.value || !containerRef.value || !sectionRef.value) return;

	const getScrollAmount = () => {
		const servicesWidth = servicesContainerRef.value!.scrollWidth;
		const containerWidth = containerRef.value!.offsetWidth;

		// Get last item width :
		const lastItem = servicesContainerRef.value!.lastElementChild as HTMLElement;
		const lastItemWidth = lastItem?.offsetWidth || 0;

		// Start Position: Just outside the screen on the right (containerWidth)
		const startX = containerWidth;

		// End Position: Last item centered
		// Center of last item relative to services container = servicesWidth - (lastItemWidth / 2)
		// We want this point to be at containerWidth / 2
		// So: x + (servicesWidth - lastItemWidth / 2) = containerWidth / 2
		// x = (containerWidth / 2) - servicesWidth + (lastItemWidth / 2)
		const endX = containerWidth / 2 - servicesWidth + lastItemWidth / 2;

		return {
			startX,
			endX,
			distance: startX - endX
		};
	};

	// ScrollTrigger :
	const mm = gsap.matchMedia();
	const halfViewportHeight = window.innerHeight / 2;

	mm.add(
		{
			isDesktop: `(min-width: ${breakPointsNoUnits.desktop}px)`,
			isMobile: `(max-width: ${breakPointsNoUnits.desktop - 1}px)`
		},
		(context) => {
			const { conditions } = context;
			const startTlPercent = conditions?.isMobile ? 'top' : 'top-=50%';

			const startTitlePercent = conditions?.isMobile ? '65%' : '80%';
			const endTitlePercent = conditions?.isMobile ? '-65%' : '-40%';

			//// Pin :
			ScrollTrigger.create({
				trigger: sectionRef.value,
				pin: true,
				start: 'center center',
				end: () => `+=${getScrollAmount().distance}`,
				scrub: 1,
				invalidateOnRefresh: true
			});

			//// Animation :
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: sectionRef.value,
					start: `${startTlPercent} center`,
					end: () => `+=${getScrollAmount().distance * 1.5 + halfViewportHeight}`,
					scrub: 1,
					invalidateOnRefresh: true
				}
			});

			tl.fromTo(titleRef.value, { x: startTitlePercent }, { x: endTitlePercent, ease: 'none' }, 0);

			tl.fromTo(
				servicesContainerRef.value,
				{ x: () => (conditions?.isMobile ? Math.abs(getScrollAmount().endX) : getScrollAmount().startX) },
				{ x: () => getScrollAmount().endX, ease: 'none' },
				0
			);
		}
	);
}, sectionRef);
</script>

<template>
	<section ref="sectionRef" class="modules other-services">
		<div ref="containerRef" class="content-container">
			<h2 ref="titleRef">{{ blok.title || $t('myServices') }}</h2>
			<div ref="servicesContainerRef" class="services-container" :class="{ 'is-odd': services.length % 2 === 0 }">
				<a
					v-for="service in services"
					:key="service.uuid"
					v-magnetic="{
						strength: 0.4,
						range: 125,
						parallax: { target: '.cover-inner-wrapper', strength: 0.05 }
					}"
					:href="`/${service.full_slug}`"
					class="service-wrapper"
					:data-cursor-label="$t('learnMore')"
				>
					<div class="cover-wrapper">
						<div class="cover-inner-wrapper">
							<Image
								:src="service.content.informations[0].cover"
								:aspect-ratio="360 / 440"
								:sizes="[{ desktop: '360px' }, '230px']"
							/>
						</div>
					</div>
					<div class="label-wrapper">
						<span class="service-name"> /<RichText :doc="service.content.informations[0].name" /> </span>
					</div>
				</a>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
$serviceHeight: fluidSize(440px, 280px, null, xxlarge);

.other-services {
	z-index: 1;
	display: flex;
	align-items: center;
	background: linear-gradient(
		180deg,
		rgba($white, 0) 0%,
		rgba($ivory, 1) 40%,
		rgba($ivory, 1) 60%,
		rgba($white, 0) 100%
	);

	@include mq($until: desktop) {
		padding-block: fluidSize(140px, 120px, null, desktop);
	}
}

.content-container {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;

	@include mq($until: tablet) {
		@include lvh(50, height);

		max-height: 640px;
	}

	@include mq(tablet) {
		aspect-ratio: 16 / 9;
	}

	& > h2 {
		position: absolute;
		margin-top: -0.14em;
		line-height: 1;
		white-space: nowrap;
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
	column-gap: fluidSize(320px, 180px);
	height: calc($serviceHeight * 2 + 5%);

	&.is-odd {
		.service-wrapper {
			&:nth-child(odd) {
				align-self: flex-start;
			}

			&:nth-child(even) {
				align-self: flex-end;
			}
		}
	}

	&:not(.is-odd) {
		.service-wrapper {
			&:nth-child(odd) {
				align-self: flex-end;
			}

			&:nth-child(even) {
				align-self: flex-start;
			}
		}
	}
}

.service-wrapper {
	position: relative;
	height: $serviceHeight;
	aspect-ratio: 360 / 440;
	background: $ivory;
	box-shadow: 30px 30px 60px rgba($eerieBlack, 0.15);
	overflow: hidden;
	flex-shrink: 0;

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba($eerieBlack, 0) 75%, rgba($eerieBlack, 0.2) 100%);
	}

	.cover-wrapper {
		overflow: hidden;

		.cover-inner-wrapper {
			&.parallax-target {
				transform: scale3d(1.075, 1.075, 1);
			}
		}

		img {
			@include img-fill;
		}
	}

	.label-wrapper {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 20px;
		color: $white;

		span {
			@include roobert-14-uppercase;

			display: flex;
			align-items: center;

			:deep(.partials-rich-text) {
				display: inline-flex;

				p {
					margin: 0;
				}
			}
		}
	}
}
</style>
