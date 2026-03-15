<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { useDebounceFn } from '@vueuse/core';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

import { animations } from '#utils/Animations.ts';
import { breakPointsNoUnits } from '#utils/breakpoints.ts';
import { parseImageData, transform } from '#utils/image.ts';
import { sleep } from '#utils/sleep.ts';

import Slideshow from '#components/partials/Slideshow.vue';
import Button from '#components/utils/Button.vue';
import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';

import type { StoryblokAsset } from '#types/component-types-sb.js';

import { $global } from '#stores/global.ts';
import { $projectMinimap, closeMinimap } from '#stores/project.ts';

// TODO : Remove Flick when the transition animation is finished
// Props :
const { pictures } = defineProps<{
	pictures: StoryblokAsset[];
}>();

// Refs :
const projectMinimapStore = useStore($projectMinimap);

const viewerWrapperRef = useTemplateRef('viewerWrapperRef');
const slideshowRef = useTemplateRef('slideshowRef');
const themeCtaRef = useTemplateRef('themeCtaRef');

const isOpening = ref(false);
const isClosing = ref(false);
const isVisible = ref(false);
const currentSlide = ref(0);
const isDarkTheme = ref(false);
const currentPictureZoom = ref(1);
const isZoomSmooth = ref(false);

const isDesktop = ref(false);

// Computed :
const formattedZoom = computed(() => currentPictureZoom.value.toFixed(1));
const isSlideshowHidden = computed(() => currentPictureZoom.value > 1.25);

// Methods :
const goToNext = () => {
	slideshowRef.value?.next();
};

const goToPrev = () => {
	slideshowRef.value?.prev();
};

const goToSlide = (index: number) => {
	if (slideshowRef.value?.isMoving) return;
	slideshowRef.value?.scrollToSlide(index);
};

const onWheel = (e: WheelEvent) => {
	if (!isVisible.value || pictures.length <= 1) return;
	if (Math.abs(e.deltaY) > 20) {
		if (e.deltaY > 0) goToNext();
		else goToPrev();
	}
};

const onKeyDown = (e: KeyboardEvent) => {
	if (!isVisible.value) return;

	e.preventDefault();

	if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
		goToPrev();
	} else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
		goToNext();
	} else if (e.key === 'Escape') {
		onClose();
	}
};

const preloadImage = (url: string) => {
	return new Promise((resolve, reject) => {
		const img = new window.Image();
		img.src = url;
		img.onload = resolve;
		img.onerror = reject;
	});
};

// Animations :
const animateFlipOpen = async (clickedElement: HTMLElement) => {
	if (!viewerWrapperRef.value) return;

	const state = Flip.getState(clickedElement);

	viewerWrapperRef.value.style.opacity = '1';
	viewerWrapperRef.value.style.display = 'flex';
	viewerWrapperRef.value.appendChild(clickedElement);

	return new Promise<void>((resolve) => {
		Flip.from(state, {
			absolute: true,
			duration: 0.8,
			ease: 'power2.inOut',
			onComplete: () => {
				isOpening.value = false;
				$projectMinimap.setKey('isFlipping', false);
				(projectMinimapStore.value.clickedParentElement as HTMLElement)?.appendChild(clickedElement);
				resolve();
			}
		});
	});
};

const animateFlipClose = async (
	pictureWrapper: HTMLElement,
	initialPictureWrapper: HTMLElement,
	clickedParentElement: HTMLElement
) => {
	$projectMinimap.setKey('isFlipping', true);
	initialPictureWrapper.style.opacity = '0';

	isZoomSmooth.value = true;
	currentPictureZoom.value = 1;

	await sleep(400);

	const state = Flip.getState(pictureWrapper);
	clickedParentElement.appendChild(pictureWrapper);

	return new Promise<void>((resolve) => {
		Flip.from(state, {
			absolute: true,
			duration: 0.8,
			clearProps: 'all',
			ease: 'power2.inOut',
			transform: 'scale3d(1, 1, 1)',
			onComplete: () => {
				initialPictureWrapper.style.opacity = '1';
				$projectMinimap.setKey('isFlipping', false);

				if (viewerWrapperRef.value) {
					viewerWrapperRef.value.style.display = 'none';
					viewerWrapperRef.value.appendChild(pictureWrapper);
				}
				resolve();
			}
		});
	});
};

const animateFadeClose = () => {
	return new Promise<void>((resolve) => {
		gsap.to(viewerWrapperRef.value, {
			opacity: 0,
			duration: 0.4,
			ease: 'power2.inOut',
			onComplete: () => {
				resolve();
			}
		});
	});
};

const onClose = async () => {
	if (isClosing.value) return;
	isClosing.value = true;
	$projectMinimap.setKey('isFlipping', true);

	const { initialIndex, currentIndex, clickedElement, clickedParentElement } = projectMinimapStore.value;
	const isSameImage = initialIndex === currentIndex;

	const containerGrid = (clickedParentElement as HTMLElement)?.closest('.container-grid') as HTMLElement;
	if (containerGrid) gsap.set(containerGrid, { zIndex: '1' });

	try {
		// Animation of the Theme CTA :
		animations['hide-square'](themeCtaRef.value?.$el, {
			toTopRight: true
		});

		themeCtaRef.value?.$el.querySelectorAll('svg').forEach((svg: HTMLElement) => {
			animations['scale-down'](svg, {
				delay: 0.1,
				ease: 'power3.inOut',
				reset: true,
				rotate: -25
			});
		});

		await slideshowRef.value?.animateOut();
		isVisible.value = false;

		if (isSameImage && clickedElement && clickedParentElement && viewerWrapperRef.value) {
			const pictureWrapper = viewerWrapperRef.value.querySelector('.picture-wrapper') as HTMLElement;
			const initialPictureWrapper = clickedParentElement.querySelector('.picture-wrapper') as HTMLElement;

			if (initialPictureWrapper && pictureWrapper) {
				await animateFlipClose(pictureWrapper, initialPictureWrapper, clickedParentElement as any);
			}
		} else {
			await animateFadeClose();
		}
	} finally {
		closeMinimap();
		resetMinimap();
		isClosing.value = false;
		$global.setKey('lockScroll', false);
		$projectMinimap.setKey('isFlipping', false);

		if (containerGrid) gsap.set(containerGrid, { clearProps: 'all' });
	}
};

// Watchers :
watch(
	() => projectMinimapStore.value.isOpen,
	async (isOpen) => {
		if (isOpen) {
			const { clickedElement, currentIndex } = projectMinimapStore.value;

			viewerWrapperRef.value!.style.display = 'flex';

			await nextTick();

			isOpening.value = true;
			isVisible.value = true;
			currentSlide.value = currentIndex;
			$projectMinimap.setKey('isFlipping', true);

			await nextTick();
			$global.setKey('lockScroll', true);
			slideshowRef.value?.scrollToSlide(currentIndex, true);

			slideshowRef.value?.animateInto();

			// Preload the current image with the same transformations as the Image component
			const currentPic = pictures[currentIndex];
			if (currentPic) {
				const { bind, operations } = parseImageData({ src: currentPic, objectFit: 'contain' });
				const transformer = transform(bind);
				// We target a high-res version (1920px) which is likely to be used by unpic in the viewer
				const currentUrl = transformer(bind.src, { ...operations, width: 1920 });
				preloadImage(currentUrl).catch(() => {});
			}

			// Animation of the Theme CTA :
			animations['reveal-square'](themeCtaRef.value?.$el, {
				fromTopRight: true
			});

			themeCtaRef.value?.$el.querySelectorAll('svg').forEach((svg: HTMLElement) => {
				animations['scale-up'](svg, {
					delay: 0.15,
					ease: 'power3.inOut',
					reset: true,
					rotate: 35
				});
			});

			if (clickedElement) await animateFlipOpen(clickedElement as any);
		} else {
			if (isVisible.value && !isClosing.value) onClose();
		}
	}
);

const onToggleDarkTheme = () => {
	isDarkTheme.value = !isDarkTheme.value;
};

const onHandlePictureZoom = (value: number) => {
	isZoomSmooth.value = true;
	currentPictureZoom.value = value;

	setTimeout(() => {
		isZoomSmooth.value = false;
	}, 400);
};

const resetMinimap = () => {
	isDarkTheme.value = false;
	isZoomSmooth.value = false;
	currentPictureZoom.value = 1;
};

const checkBreakpoint = () => {
	isDesktop.value = window.innerWidth >= breakPointsNoUnits.desktop;
};

const debouncedResize = useDebounceFn(checkBreakpoint, 200);

watch(currentSlide, (index) => {
	$projectMinimap.setKey('currentIndex', index);
});

// Attach & Detach :
onMounted(() => {
	checkBreakpoint();
	window.addEventListener('resize', debouncedResize);
	window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
	$global.setKey('lockScroll', false);
	window.removeEventListener('resize', debouncedResize);
	window.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
	<section
		ref="rootRef"
		class="partials-project-minimap"
		:class="{ 'is-dark': isDarkTheme, 'is-visible': isVisible }"
		data-lenis-prevent
	>
		<div class="overlay" />
		<Button ref="themeCtaRef" class="theme-cta" :class="{ 'is-dark': isDarkTheme }" @click="onToggleDarkTheme">
			<div class="icon-wrapper">
				<Icon name="moon" />
			</div>
			<div class="icon-wrapper">
				<Icon name="sun" />
			</div>
		</Button>
		<div class="viewer-container">
			<div
				class="picture-viewer-container col-start-dk-10 col-end-dk-24 col-start-mlg-9 col-end-mlg-25 col-start-xlg-8 col-end-xlg-26"
			>
				<div class="picture-inner-wrapper" ref="viewerWrapperRef">
					<div
						v-if="!isOpening"
						class="picture-wrapper"
						:class="{ 'is-smooth': isZoomSmooth }"
						:style="{ transform: `scale3d(${currentPictureZoom}, ${currentPictureZoom}, 1)` }"
					>
						<Image :src="pictures[currentSlide]" object-fit="contain" />
					</div>
				</div>
			</div>
		</div>
		<div class="minimap-container">
			<Slideshow
				ref="slideshowRef"
				v-model="currentSlide"
				class="col-start-dk-5 col-end-dk-8 col-start-mlg-4 col-end-mlg-7 col-start-xlg-3 col-end-xlg-6"
				:enabled="pictures.length > 1"
				:is-hidden="isSlideshowHidden"
				@wheel.passive="onWheel"
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
			</Slideshow>
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
					@pointerdown="isZoomSmooth = false"
				/>
			</div>
			<div class="custom-thumb-wrapper">
				<div
					class="custom-thumb"
					:class="{ 'is-smooth': isZoomSmooth }"
					:style="{
						left: `calc(${((currentPictureZoom - 0.5) / 1.5) * 100}% - ${((currentPictureZoom - 0.5) / 1.5) * 32}px)`
					}"
				>
					<span>{{ formattedZoom }}</span>
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
	overflow: hidden;
	pointer-events: none;

	&.is-dark {
		.overlay {
			background: $smokyBlack;
		}
	}

	&.is-visible {
		pointer-events: all;

		.overlay,
		.minimap-container,
		.theme-cta,
		.zoom-container {
			opacity: 1;
		}
	}

	.minimap-container {
		opacity: 0;
	}

	.theme-cta,
	.zoom-container {
		opacity: 0;
		transition: opacity 0.4s $power2InOut;
	}

	@include mq($until: desktop) {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--gutter);
		padding-block: calc(var(--header-height) + (var(--gutter) * 2));
	}
}

.overlay {
	position: absolute;
	inset: 0;
	opacity: 0;
	background: $white;
	transition:
		opacity 0.4s $power2InOut,
		background 0.4s $power2InOut;
}

.theme-cta {
	position: absolute;
	z-index: 1;
	top: var(--gutter);
	right: var(--gutter);
	background: $whiteChoco;
	height: var(--header-height);
	border-radius: var(--border-radius);
	aspect-ratio: 1/1;
	overflow: hidden;

	&.is-dark {
		.icon-wrapper {
			&:first-child {
				transform: translate3d(-50%, -275%, 0) rotate(-65deg);
			}

			&:last-child {
				transform: translate3d(-50%, -45%, 0);
			}
		}
	}

	.icon-wrapper {
		position: absolute;
		top: 50%;
		left: 50%;
		transition: transform 0.6s $power2InOut;

		&:first-child {
			transform: translate3d(-50%, -50%, 0);
		}

		&:last-child {
			transform: translate3d(-50%, 175%, 0) rotate(80deg);
		}
	}
}

.viewer-container {
	pointer-events: none;

	@include mq($until: desktop) {
		@include container;

		height: calc(
			100svh - (var(--header-height) + (var(--gutter) * 2) * 4) - fluidSize(150px, 125px, null, desktop)
		);
	}

	@include mq(desktop) {
		@include container-grid;

		position: absolute;
		inset: 0;
	}
}

.picture-viewer-container {
	display: flex;
	align-items: center;
	justify-content: center;

	@include mq($until: desktop) {
		@include container;

		height: 100%;
	}

	@include mq(desktop) {
		height: 100vh;
		padding-block: calc(var(--header-height) + (var(--gutter) * 2));
	}

	.picture-inner-wrapper {
		display: none;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	:deep(.picture-wrapper) {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		&.is-smooth {
			transition: transform 0.4s $power2Out;
		}
	}
}

.minimap-container {
	@include mq($until: desktop) {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	@include mq(desktop) {
		@include container-grid;

		height: 100%;
	}
}

.slideshow-container {
	position: relative;

	@include mq($until: desktop) {
		padding-inline: var(--gutter);
	}

	@include mq(desktop) {
		height: 100vh;
		touch-action: none;
	}
}

.slideshow-wrapper {
	& > .picture-wrapper {
		height: 100%;

		&.is-current {
			pointer-events: none;
		}

		@include mq($until: desktop) {
			min-width: 0;
			flex: 0 0 fluidSize(150px, 85px);
			height: fit-content;
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

	& > input[type='range'] {
		position: relative;
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
		height: 100%;
		background: transparent;
		cursor: pointer;

		&:focus {
			outline: none;
		}

		// Track :
		&::-webkit-slider-runnable-track {
			width: 100%;
			height: 100%;
		}

		&::-moz-range-track {
			width: 100%;
			height: 100%;
		}

		// Thumb (hidden but functional) :
		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 0;
			height: 0;
			border: none;
			margin-top: -1px;
			background: transparent;
		}

		&::-moz-range-thumb {
			width: 0;
			height: 0;
			border: none;
			background: transparent;
		}
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
		margin-block-end: 1px;
	}
}
</style>
