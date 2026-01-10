<script setup lang="ts">
import { useVModel } from '@nanostores/vue';
import emblaCarouselVue from 'embla-carousel-vue';
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

import Button from '#components/utils/Button.vue';
import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';

import type { StoryblokAsset } from '#types/component-types-sb.js';

import { $global } from '#stores/global.ts';

// Props :
const { pictures } = defineProps<{
	pictures: StoryblokAsset[];
}>();

// Refs :
const lockScroll = useVModel($global, 'lockScroll');
const currentSlide = ref(0);
const isGrabbing = ref(false);
const isDarkTheme = ref(false);
const currentPictureZoom = ref(1);
const isZoomIndicatorSmooth = ref(false);

const [emblaRef, emblaApi] = emblaCarouselVue({
	align: 'start',
	active: (pictures?.length ?? 0) > 1 ? true : false,
	breakpoints: {
		'(min-width: 1024px)': { axis: 'y' }
	}
});

// Computed :
const formattedZoom = computed(() => currentPictureZoom.value.toFixed(1));
const isSlideshowHidden = computed(() => currentPictureZoom.value > 1.25);

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

const goToSlide = (index: number) => {
	if (!emblaApi.value || index === emblaApi.value.selectedScrollSnap()) return;
	emblaApi.value.scrollTo(index);
};

const onToggleDarkTheme = () => {
	isDarkTheme.value = !isDarkTheme.value;
};

const onHandlePictureZoom = (value: number) => {
	isZoomIndicatorSmooth.value = true;
	currentPictureZoom.value = value;

	setTimeout(() => {
		isZoomIndicatorSmooth.value = false;
	}, 400);
};

// Attach & Detach :
onMounted(() => {
	lockScroll.value = true;

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
	lockScroll.value = false;

	if (!emblaApi.value) return;

	// Events :
	emblaApi.value.off('select', updateCurrentSlide);
	emblaApi.value.off('reInit', updateCurrentSlide);
	emblaApi.value.off('pointerDown', onPointerDown);
	emblaApi.value.off('pointerUp', onPointerUp);
});
</script>

<template>
	<section class="partials-project-minimap" :class="{ 'is-dark': isDarkTheme }" data-lenis-prevent>
		<Button class="theme-cta" @click="onToggleDarkTheme">
			<span>
				{{ isDarkTheme ? 'Light' : 'Dark' }}
			</span>
		</Button>
		<div class="minimap-container">
			<div
				class="slideshow-container col-start-dk-5 col-end-dk-8 col-start-mlg-4 col-end-mlg-7 col-start-xlg-3 col-end-xlg-6"
				ref="emblaRef"
			>
				<div
					class="slideshow-wrapper"
					:class="{
						'can-grab': emblaApi && pictures.length > 1,
						'is-grabbing': isGrabbing,
						'is-hidden': isSlideshowHidden
					}"
				>
					<Button
						class="picture-wrapper"
						v-for="(picture, index) in pictures"
						:key="index"
						:data-cursor-label="$t('visualize')"
						@click="goToSlide(index)"
						:class="{ 'is-current': index === currentSlide }"
					>
						<Image :src="picture" object-fit="contain" />
					</Button>
				</div>
			</div>
			<div
				class="picture-viewer-container col-start-dk-10 col-end-dk-24 col-start-mlg-9 col-end-mlg-25 col-start-xlg-8 col-end-xlg-26"
				:style="{ transform: `scale3d(${currentPictureZoom}, ${currentPictureZoom}, 1)` }"
			>
				<div class="picture-wrapper">
					<Image :src="pictures[currentSlide]" object-fit="contain" />
				</div>
			</div>
			<div class="zoom-container hide-mobile-tablet">
				<div class="zoom-inner-container">
					<Button
						v-for="value in [0.5, 1, 1.5, 2]"
						:key="value"
						@click="onHandlePictureZoom(value)"
						:class="{ 'is-active': currentPictureZoom === value }"
					>
						<Icon name="square-small" />
					</Button>
				</div>
				<div class="range-wrapper">
					<input
						type="range"
						min="0.5"
						max="2.0"
						v-model.number="currentPictureZoom"
						step="0.001"
						class="zoom-range"
						@pointerdown="isZoomIndicatorSmooth = false"
					/>
				</div>
				<div class="custom-thumb-wrapper">
					<div
						class="custom-thumb"
						:class="{ 'is-smooth': isZoomIndicatorSmooth }"
						:style="{
							left: `calc(${((currentPictureZoom - 0.5) / 1.5) * 100}% - ${((currentPictureZoom - 0.5) / 1.5) * 32}px)`
						}"
					>
						<span>{{ formattedZoom }}</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.partials-project-minimap {
	position: fixed;
	z-index: 20;
	inset: 0;
	background: $white;
	overflow: hidden;
	transition: background 0.4s $power2InOut;

	&.is-dark {
		background: $smokyBlack;
	}
}

.theme-cta {
	position: absolute;
	z-index: 1;
	top: var(--gutter);
	right: var(--gutter);
	display: flex;
	align-items: center;
	justify-content: center;
	background: $whiteChoco;
	height: var(--header-height);
	border-radius: var(--border-radius);
	aspect-ratio: 1/1;
}

.picture-viewer-container {
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	transition: transform 0.4s $power2Out;

	@include mq($until: desktop) {
		@include container;

		transform: none !important;
	}

	.picture-wrapper {
		height: 100%;
		padding-block: calc(var(--header-height) + (var(--gutter) * 2));
	}
}

.minimap-container {
	height: 100%;

	@include mq($until: desktop) {
		display: flex;
		flex-direction: column;
		padding-block: calc(var(--header-height) + (var(--gutter) * 2));
	}

	@include mq(desktop) {
		@include container-grid;
	}
}

.slideshow-container {
	position: relative;
	overflow: hidden;

	@include mq($until: desktop) {
		order: 1;
		padding-block: fluidSize(60px, 48px, null, desktop);
		padding-inline: var(--gutter);
	}

	@include mq(desktop) {
		padding-block-start: 50vh;
	}
}

.slideshow-wrapper {
	display: flex;
	gap: $gap;
	transition: opacity 0.4s $power2InOut;

	@include mq(desktop) {
		&.is-hidden {
			opacity: 0;
			pointer-events: none;
		}
	}

	&.can-grab {
		cursor: grab;
	}

	&.is-grabbing {
		cursor: grabbing;
	}

	@include mq($until: desktop) {
		min-height: fluidSize(150px, 100px, null, desktop);
	}

	@include mq(desktop) {
		flex-direction: column;
		height: 100vh;
	}

	& > .picture-wrapper {
		height: 100%;
		transition: opacity 0.4s $power2InOut;

		&.is-current {
			pointer-events: none;
			opacity: 0.75;
		}

		@include mq($until: desktop) {
			min-width: 0;
			flex: 0 0 25%;
			max-width: fluidSize(150px, 125px, null, desktop);
		}

		@include mq(desktop) {
			width: 100%;
		}
	}
}

.zoom-container {
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translate3d(-50%, 0, 0);
	display: flex;
	align-items: center;
	justify-content: center;
	height: var(--header-height);
	margin: var(--gutter);
	background: $whiteChoco;
	border-radius: var(--border-radius);
	padding-inline: fluidSize(24px, 20px);
	width: fluidSize(280px, 240px);
}

.zoom-inner-container {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	pointer-events: none;

	&::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		transform: translate3d(0, -50%, 0);
		width: 100%;
		height: 1px;
		background: rgba($khaki, 0.25);
	}

	& > button {
		@include a11y-focus(-6px);

		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		color: $khaki;
		pointer-events: all;
		transition: color 0.4s $power2Out;

		&.is-active {
			color: $eerieBlack;
		}

		@include hover {
			color: $eerieBlack;

			svg {
				transform: scale3d(1.25, 1.25, 1);
			}
		}

		svg {
			transition: transform 0.4s $elasticOut;
		}
	}
}

.range-wrapper {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate3d(-50%, -50%, 0);
	width: calc(100% - fluidSize(20px, 16px));
	height: 22px;
}

.zoom-range {
	position: relative;
	appearance: none;
	width: 100%;
	background: transparent;
	cursor: pointer;

	&:focus {
		outline: none;
	}

	// Track :
	&::-webkit-slider-runnable-track,
	&::-moz-range-track {
		width: 100%;
		height: 2px;
		background: rgba($smokyBlack, 0.1);
	}

	// Thumb (hidden but functional) :
	&::-webkit-slider-thumb,
	&::-moz-range-thumb {
		appearance: none;
		width: 32px;
		height: 22px;
		background: transparent;
		border: none;
	}
}

.custom-thumb-wrapper {
	position: absolute;
	z-index: 2;
	top: 50%;
	left: 50%;
	transform: translate3d(-50%, -50%, 0);
	width: calc(100% - fluidSize(20px, 16px));
}

.custom-thumb {
	position: absolute;
	z-index: 1;
	top: 50%;
	transform: translate3d(0, -50%, 0);
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 22px;
	border-radius: 3px;
	background: $eerieBlack;
	pointer-events: none;
	transition: left 0s;

	&.is-smooth {
		transition: left 0.4s $power2Out;
	}

	span {
		@include roobert-12-uppercase;

		color: $white;
		display: flex;
		margin-block-end: fluidSize(2px, 1px);
	}
}
</style>
