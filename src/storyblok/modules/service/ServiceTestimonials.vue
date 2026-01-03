<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue';
import { ref } from 'vue';
import { onMounted } from 'vue';

import { formatIndex } from '#utils/formatIndex.ts';
import { getLinkAttributes } from '#utils/link.ts';
import { nl2br } from '#utils/nl2br.ts';

import LabelShuffle from '#components/partials/LabelShuffle.vue';
import Button from '#components/utils/Button.vue';
import Icon from '#components/utils/Icon.vue';

import type { StoryblokServiceTestimonials } from '#types/component-types-sb.js';

import ServiceTestimonialsItem from '#storyblok/partials/service/ServiceTestimonialsItem.vue';

// Props :
const { blok } = defineProps<{
	blok: StoryblokServiceTestimonials;
}>();

// Refs :
const currentSlide = ref(0);
const isGrabbing = ref(false);

const [emblaRef, emblaApi] = emblaCarouselVue({
	active: (blok.testimonials?.length ?? 0) > 1 ? true : false,
	loop: false
});

// Methods :
const updateCurrentSlide = () => {
	if (!emblaApi.value) return;
	currentSlide.value = emblaApi.value.selectedScrollSnap();
};

const onPointerDown = () => {
	isGrabbing.value = true;
};

const onPointerUp = () => {
	isGrabbing.value = false;
};

// Attach :
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
</script>

<template>
	<section v-if="blok.testimonials?.length" class="modules service-testimonials">
		<div class="container-grid">
			<h2 class="col-start-1 col-end-13 col-start-tb-1 col-end-tb-4">{{ blok.title }}</h2>
			<div
				class="description-wrapper col-start-1 col-end-13 col-start-tb-4 col-end-tb-13 col-start-dk-5 col-end-dk-16 col-start-lg-6 col-end-lg-15 col-start-xxlg-6 col-end-xxlg-14 col-start-wd-6 col-end-wd-13"
			>
				<p v-html="nl2br(blok.description)" />
				<Button
					v-if="blok.link?.[0]"
					v-bind="getLinkAttributes(blok.link[0])"
					theme="dot-dark"
					:text="blok.link[0].label"
					:link="blok.link[0].link"
				/>
			</div>
			<div
				class="testimonials-container col-start-1 col-end-13 col-start-tb-4 col-end-tb-15 col-start-dk-5 col-end-dk-26 col-start-lg-6 col-end-lg-26 col-start-xxlg-6 col-end-xxlg-23"
			>
				<div class="slideshow-container" ref="emblaRef">
					<div
						class="slideshow-wrapper"
						:class="{
							'can-grab': emblaApi && (blok.testimonials?.length ?? 0) > 1,
							'is-grabbing': isGrabbing
						}"
					>
						<ServiceTestimonialsItem
							v-for="testimonial in blok.testimonials"
							:key="testimonial._uid"
							:blok="testimonial"
						/>
					</div>
				</div>
				<div v-if="(blok.testimonials?.length ?? 0) > 1 && emblaApi" class="slideshow-navigation">
					<div class="indicator-wrapper">
						<span>{{ formatIndex(currentSlide + 1) }}</span>
						<Icon name="square-small" />
						<span>{{ formatIndex(blok.testimonials?.length ?? 0) }}</span>
					</div>
					<div class="ctas-wrapper">
						<Button @click="emblaApi.scrollPrev()" :disabled="!emblaApi.canScrollPrev()">
							<LabelShuffle :label="$t('previous')" />
						</Button>
						<Button @click="emblaApi.scrollNext()" :disabled="!emblaApi.canScrollNext()">
							<LabelShuffle :label="$t('next')" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.service-testimonials {
	padding-block: fluidSize(100px, 80px);
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
	margin-block-start: fluidSize(120px, 80px);
}

.slideshow-container {
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

	& > :deep(.partials-service-testimonials-item) {
		min-width: 0;
		flex: 0 0 100%;
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
		margin-block-start: fluidSize(4px, 2px, null, widescreen);
	}

	span {
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
