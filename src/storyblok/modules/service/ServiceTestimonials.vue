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

import type { StoryblokServiceTestimonials } from '#types/component-types-sb.js';

import ServiceTestimonialsItem from '#storyblok/partials/service/ServiceTestimonialsItem.vue';

// Props :
const { blok } = defineProps<{
	blok: StoryblokServiceTestimonials;
}>();

// Refs :
const canPrev = ref(false);
const canNext = ref(false);
const currentSlide = ref(0);
const isGrabbing = ref(false);
const isWaiting = ref(false);
const hoveredIndex = ref<number | null>(null);
let waitingTimeout: ReturnType<typeof setTimeout> | null = null;

const [emblaRef, emblaApi] = emblaCarouselVue({
	active: (blok.testimonials?.length ?? 0) > 1 ? true : false
});

// Computed :
const testimonials = computed(() => blok.testimonials || []);
const hoveredTestimonial = computed(() =>
	hoveredIndex.value !== null ? testimonials.value[hoveredIndex.value] : null
);
const showImages = computed(() => hoveredIndex.value !== null && !isGrabbing.value && !isWaiting.value);
const displayPictures = computed(() => (showImages.value ? hoveredTestimonial.value?.pictures || [] : []));

// Methods :
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
			<h2 class="col-start-1 col-end-13 col-start-tb-1 col-end-tb-4">{{ blok.title }}</h2>
			<div
				class="description-wrapper col-start-1 col-end-13 col-start-tb-4 col-end-tb-13 col-start-dk-6 col-end-dk-17 col-start-lg-6 col-end-lg-15 col-start-xxlg-6 col-end-xxlg-14 col-start-wd-6 col-end-wd-13"
			>
				<p v-html="nl2br(blok.description)" />
				<Button
					v-if="blok.link?.[0]"
					v-bind="getLinkAttributes(blok.link[0])"
					theme="dot-dark"
					:text="blok.link[0].label"
					:link="blok.link[0].link"
					@click="
						blok.link[0].link.component === 'Forms'
							? trackFormOpenClick($event, { formId: (blok.link[0].link.story as any)?.content?.id })
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
							class="slideshow-item"
							:class="{ disabled: currentSlide !== index }"
							:style="{
								opacity:
									hoveredIndex !== null &&
									hoveredIndex !== index &&
									displayPictures.length &&
									!isGrabbing
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
						<CounterShuffle :value="currentSlide + 1" />
						<Icon name="square-small" />
						<span>{{ formatIndex(blok.testimonials?.length ?? 0) }}</span>
					</div>
					<div class="ctas-wrapper">
						<Button @click="emblaApi.scrollPrev()" :disabled="!canPrev">
							<LabelShuffle :label="$t('previous')" :is-active="canPrev" />
						</Button>
						<Button @click="emblaApi.scrollNext()" :disabled="!canNext">
							<LabelShuffle :label="$t('next')" :is-active="canNext" />
						</Button>
					</div>
				</div>
			</div>
			<div class="pictures-container hide-mobile-tablet">
				<TransitionGroup name="picture-anim">
					<div
						v-for="(item, index) in displayPictures"
						:key="item._uid"
						class="picture-wrapper"
						:class="layouts[index]?.classes"
						:style="{ alignSelf: layouts[index]?.align, '--index': index }"
					>
						<Image :src="item.picture" object-fit="contain" />
					</div>
				</TransitionGroup>
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

		img {
			height: auto;
			max-height: inherit;
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

// Transitions :
.picture-anim-enter-active {
	transition: transform 0.6s $power2Out;
	transition-delay: calc(var(--index) * 0.125s);

	img {
		transition: transform 0.6s $power2Out;
		transition-delay: calc(var(--index) * 0.125s);
	}
}

.picture-anim-leave-active {
	transition: transform 0.6s $power2InOut;
	transition-delay: calc(var(--index) * 0.125s);

	img {
		transition: transform 0.6s $power2InOut;
		transition-delay: calc(var(--index) * 0.125s);
	}
}

.picture-anim-enter-from {
	transform: translate3d(0, 105%, 0);

	img {
		transform: translate3d(0, -105%, 0);
	}
}

.picture-anim-leave-to {
	transform: translate3d(0, -105%, 0);

	img {
		transform: translate3d(0, 105%, 0);
	}
}
</style>
