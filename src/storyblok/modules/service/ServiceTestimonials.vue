<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { formatIndex } from '#utils/formatIndex.ts';
import { getLinkAttributes } from '#utils/link.ts';
import { nl2br } from '#utils/nl2br.ts';
import { trackFormOpenClick, trackNavigationClick } from '#utils/tracking.ts';

import LabelShuffle from '#components/partials/LabelShuffle.vue';
import Button from '#components/utils/Button.vue';
import CounterShuffle from '#components/utils/CounterShuffle.vue';
import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';

import type { StoryblokLabelLink, StoryblokServiceTestimonials } from '#types/component-types-sb.js';

import ServiceTestimonialsItem from '#storyblok/partials/service/ServiceTestimonialsItem.vue';

// Props :
const { blok, title, description, link } = defineProps<{
	blok: StoryblokServiceTestimonials;
	title: string;
	description: string;
	link?: StoryblokLabelLink[];
}>();

// Refs :
const canPrev = ref(false);
const canNext = ref(false);
const currentSlide = ref(0);
const isGrabbing = ref(false);
const isWaiting = ref(false);
const hoveredIndex = ref<number | null>(null);
const finishedUids = ref(new Set<string>());
const inFlightUids = ref(new Set<string>());

let waitingTimeout: ReturnType<typeof setTimeout> | null = null;

const [emblaRef, emblaApi] = emblaCarouselVue({
	active: (blok.testimonials?.length ?? 0) > 1 ? true : false
});

// Computed :
const testimonials = computed(() => blok.testimonials || []);
const isVisible = computed(() => hoveredIndex.value !== null && !isGrabbing.value && !isWaiting.value);

// Methods :
const getDelay = (uid: string, index: number) => {
	if (inFlightUids.value.has(uid)) return '0s';
	return `${index * 0.125}s`;
};

const updateCurrentSlide = () => {
	if (!emblaApi.value) return;

	canPrev.value = emblaApi.value.canScrollPrev();
	canNext.value = emblaApi.value.canScrollNext();
	currentSlide.value = emblaApi.value.selectedScrollSnap();
};

// Events :
const onPointerDown = () => {
	isGrabbing.value = true;
	if (waitingTimeout) clearTimeout(waitingTimeout);
	isWaiting.value = false;
};

const onPointerUp = () => {
	isGrabbing.value = false;
	isWaiting.value = true;

	if (waitingTimeout) clearTimeout(waitingTimeout);
	waitingTimeout = setTimeout(() => {
		isWaiting.value = false;
	}, 800);
};

const onMouseEnter = (index: number) => {
	hoveredIndex.value = index;
};

const onMouseLeave = () => {
	hoveredIndex.value = null;
};

// Animations :
const onTransitionStart = (el: any, uid: string) => {
	if (el.propertyName === 'transform') {
		inFlightUids.value.add(uid);
	}
};

const onTransitionEnd = (el: any, uid: string) => {
	if (el.propertyName === 'transform') {
		inFlightUids.value.delete(uid);

		// If the element just finished its exit animation (not active anymore) :
		if (!el.target.classList.contains('is-active')) {
			finishedUids.value.delete(uid);
		} else {
			// If it just finished its entrance animation :
			finishedUids.value.add(uid);
		}
	}
};

// Attach & Detach :
onMounted(() => {
	if (!emblaApi.value) return;

	// Events :
	emblaApi.value.on('select', updateCurrentSlide);
	emblaApi.value.on('reInit', updateCurrentSlide);
	emblaApi.value.on('pointerDown', onPointerDown);
	emblaApi.value.on('pointerUp', onPointerUp);

	// Init :
	updateCurrentSlide();
});

onUnmounted(() => {
	if (!emblaApi.value) return;

	// Events :
	emblaApi.value.off('select', updateCurrentSlide);
	emblaApi.value.off('reInit', updateCurrentSlide);
	emblaApi.value.off('pointerDown', onPointerDown);
	emblaApi.value.off('pointerUp', onPointerUp);
});

// Layouts :
const layouts = [
	{
		classes: [
			'col-start-dk-20',
			'col-end-dk-25',
			'col-start-lg-20',
			'col-end-lg-25',
			'col-start-xxlg-20',
			'col-end-xxlg-25'
		],
		align: 'start'
	},
	{
		classes: [
			'col-start-dk-2',
			'col-end-dk-5',
			'col-start-lg-2',
			'col-end-lg-5',
			'col-start-xxlg-2',
			'col-end-xxlg-5'
		],
		align: 'center'
	},
	{
		classes: [
			'col-start-dk-27',
			'col-end-dk-33',
			'col-start-lg-27',
			'col-end-lg-33',
			'col-start-xxlg-27',
			'col-end-xxlg-33'
		],
		align: 'end'
	}
];
</script>

<template>
	<section v-if="testimonials?.length" id="service-testimonials" class="modules service-testimonials">
		<div class="container-grid">
			<h2 v-animate="'reveal-letters'" class="col-start-1 col-end-13 col-start-tb-1 col-end-tb-4">
				{{ title }}
			</h2>
			<div
				class="description-wrapper col-start-1 col-end-13 col-start-tb-4 col-end-tb-13 col-start-dk-6 col-end-dk-17 col-start-lg-6 col-end-lg-15 col-start-xxlg-6 col-end-xxlg-14 col-start-wd-6 col-end-wd-13"
			>
				<p v-animate="'reveal-paragraphs'" v-html="nl2br(description)" />
				<Button
					v-if="link?.[0]"
					v-animate="{ type: 'reveal-button-dot', options: { delay: 0.035 } }"
					v-bind="getLinkAttributes(link[0])"
					theme="dot-dark"
					:text="link[0].label"
					:link="link[0].link"
					@click="
						link[0].link.component === 'Forms'
							? trackFormOpenClick($event, { formId: (link[0].link.story as any)?.content?.id })
							: trackNavigationClick
					"
				/>
			</div>
			<div
				class="testimonials-container col-start-1 col-end-13 col-start-tb-4 col-end-tb-15 col-start-dk-6 col-end-dk-27 col-start-lg-6 col-end-lg-26 col-start-xxlg-6 col-end-xxlg-23"
			>
				<div class="slideshow-container" ref="emblaRef">
					<div
						class="slideshow-wrapper"
						:class="{
							'can-grab': emblaApi && testimonials.length > 1,
							'is-grabbing': isGrabbing
						}"
					>
						<ServiceTestimonialsItem
							v-for="(testimonial, index) in testimonials"
							:key="testimonial._uid"
							:blok="testimonial"
							:index="index"
							class="slideshow-item"
							:class="{ disabled: currentSlide !== index }"
							:style="{
								opacity:
									hoveredIndex !== null && hoveredIndex !== index && isVisible && !isGrabbing
										? 0.4
										: 1
							}"
							@mouseenter="onMouseEnter(index)"
							@mouseleave="onMouseLeave"
						/>
					</div>
				</div>
				<div v-if="(blok.testimonials?.length ?? 0) > 1 && emblaApi" class="slideshow-navigation">
					<div class="indicator-wrapper">
						<CounterShuffle
							v-animate="{ type: 'reveal-label-shuffle', options: { delay: 0.035 } }"
							:value="currentSlide + 1"
							reveal
						/>
						<Icon
							v-animate="{ type: 'scale-up', options: { delay: 0.085, duration: 0.6, rotate: 90 } }"
							name="square-small"
						/>
						<span v-animate="{ type: 'reveal-letters', options: { delay: 0.065 } }">{{
							formatIndex(blok.testimonials?.length ?? 0)
						}}</span>
					</div>
					<div class="ctas-wrapper">
						<Button @click="emblaApi.scrollPrev()" :disabled="!canPrev">
							<LabelShuffle :label="$t('previous')" :is-active="canPrev" reveal />
						</Button>
						<Button @click="emblaApi.scrollNext()" :disabled="!canNext">
							<LabelShuffle
								v-animate="{ type: 'reveal-label-shuffle', options: { delay: 0.125 } }"
								:label="$t('next')"
								:is-active="canNext"
								reveal
							/>
						</Button>
					</div>
				</div>
			</div>
			<div class="pictures-container hide-mobile-tablet">
				<div v-for="(testimonial, tIndex) in testimonials" :key="testimonial._uid" style="display: contents">
					<div
						v-for="(item, pIndex) in testimonial.pictures"
						:key="item._uid"
						class="picture-wrapper"
						:class="[
							layouts[pIndex]?.classes,
							{
								'is-active': isVisible && tIndex === hoveredIndex,
								'is-finished': finishedUids.has(item._uid)
							}
						]"
						:style="{
							alignSelf: layouts[pIndex]?.align,
							'--index': pIndex,
							'--delay': getDelay(item._uid, pIndex)
						}"
						@transitionstart="onTransitionStart($event, item._uid)"
						@transitionend="onTransitionEnd($event, item._uid)"
					>
						<Image :src="item.picture" object-fit="contain" />
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.service-testimonials {
	margin-block-start: fluidSize(96px, 36px, null, xxlarge);
	padding-block: fluidSize(96px, 36px, null, xxlarge) fluidSize(142px, 96px, null, xxlarge);
}

.container-grid {
	& > h2 {
		@include roobert-14-uppercase;

		@include mq(tablet) {
			margin-block-start: 2px;
		}
	}
}

.description-wrapper {
	display: flex;
	flex-direction: column;
	gap: fluidSize(20px, 16px);

	& > p {
		@include roobert-18;
	}
}

.testimonials-container {
	margin-block-start: fluidSize(140px, 80px);
}

.slideshow-container {
	position: relative;
}

.pictures-container {
	@include grid;

	position: absolute;
	inset: 0;
	margin-block-end: fluidSize(80px, 72px);
	pointer-events: none;

	.picture-wrapper {
		position: absolute;
		height: fit-content;
		overflow: hidden;
		max-height: fluidSize(220px, 160px, null, widescreen);

		transform: translate3d(0, 108%, 0);
		transition: transform 0.6s $power2InOut;
		transition-delay: var(--delay);

		img {
			height: auto;
			max-height: inherit;
			transform: translate3d(0, -108%, 0);
			transition: transform 0.6s $power2InOut;
			transition-delay: var(--delay);
		}

		&.is-active {
			transform: translate3d(0, 0, 0);
			transition-timing-function: $power2Out;

			img {
				transform: translate3d(0, 0, 0);
				transition-timing-function: $power2Out;
			}
		}

		&.is-finished:not(.is-active) {
			transform: translate3d(0, -108%, 0);

			img {
				transform: translate3d(0, 108%, 0);
			}
		}
	}
}

.slideshow-wrapper {
	display: flex;
	gap: $gap;

	&.can-grab {
		cursor: grab;
	}

	&.is-grabbing {
		cursor: grabbing;
	}

	& > :deep(.slideshow-item) {
		min-width: 0;
		flex: 0 0 100%;
		transition: opacity 0.6s $power2Out;

		&.disabled {
			pointer-events: none;
		}
	}
}

.slideshow-navigation {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-block-start: fluidSize(40px, 32px);
}

.indicator-wrapper {
	display: flex;
	align-items: center;
	gap: fluidSize(8px, 6px);

	svg {
		margin-block-start: fluidSize(3px, 2px, null, widescreen);
	}

	span,
	:deep(.counter-shuffle) {
		@include roobert-14-uppercase;
	}
}

.ctas-wrapper {
	position: relative;

	@include mq($until: tablet) {
		display: flex;
		align-items: center;
		gap: $gap;
	}

	button {
		@include mq(tablet) {
			&:last-child {
				position: absolute;
				right: 0;
				top: 0;
				transform: translate3d(calc(100% + $gap), 0, 0);
			}
		}

		:deep(.partials-label-shuffle) {
			@include roobert-14-uppercase;

			&::before {
				inset: -2px -6px -4px;
			}
		}
	}
}
</style>
