<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { useDebounceFn } from '@vueuse/core';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

import { animations } from '#utils/Animations.ts';
import { breakPointsNoUnits } from '#utils/breakpoints.ts';
import { getAspectRatio } from '#utils/image.ts';
import { sleep } from '#utils/sleep.ts';

import Slideshow from '#components/partials/Slideshow.vue';
import Button from '#components/utils/Button.vue';
import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';

import type { StoryblokAsset } from '#types/component-types-sb.js';

import { $global } from '#stores/global.ts';
import { $projectMinimap, closeMinimap } from '#stores/project.ts';

// Props :
const { pictures } = defineProps<{
	pictures: StoryblokAsset[];
}>();

// Refs :
const projectMinimapStore = useStore($projectMinimap);

const viewerWrapperRef = useTemplateRef('viewerWrapperRef');
const slideshowRef = useTemplateRef('slideshowRef');
const themeCtaRef = useTemplateRef('themeCtaRef');
const zoomContainer = useTemplateRef('zoomContainer');
const preloadRef = useTemplateRef('preloadRef');

const isOpening = ref(false);
const isClosing = ref(false);
const isVisible = ref(false);

// The full size pictures are only loaded once the minimap has been opened :
const hasBeenOpened = ref(false);
const currentSlide = ref(0);
const isDarkTheme = ref(false);
const currentPictureZoom = ref(1);
const isZoomSmooth = ref(false);
const isWheelLocked = ref(false);

const isDesktop = ref(false);

// Computed :
const formattedZoom = computed(() => currentPictureZoom.value.toFixed(1));
const isSlideshowHidden = computed(() => currentPictureZoom.value > 1.25);

// The current picture and its neighbours, rendered hidden with the same props as the viewer, so the
// browser loads the exact same files and navigating between slides is instant :
const preloadedIndexes = computed(() => {
	if (!hasBeenOpened.value) return [];

	const { currentIndex } = projectMinimapStore.value;
	const indexes = [0, 1, -1, 2, -2].map((offset) => currentIndex + offset);
	return indexes.filter((index) => index >= 0 && index < pictures.length);
});

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
	if (!isVisible.value || pictures.length <= 1 || isWheelLocked.value) return;
	if (Math.abs(e.deltaY) > 20) {
		if (e.deltaY > 0) goToNext();
		else goToPrev();

		isWheelLocked.value = true;
		setTimeout(() => {
			isWheelLocked.value = false;
		}, 50);
	}
};

const onKeyDown = (e: KeyboardEvent) => {
	if (!isVisible.value) return;

	// Only prevent the keys we handle (keep Tab, browser shortcuts...) :
	if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
		e.preventDefault();
		goToPrev();
	} else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
		e.preventDefault();
		goToNext();
	} else if (e.key === 'Escape') {
		e.preventDefault();
		onClose();
	}
};

// Wait for a preloaded picture to be loaded and decoded (with a timeout, to never block the minimap) :
const waitForPicture = async (index: number, timeout = 2000) => {
	await nextTick();

	const img = preloadRef.value?.querySelector<HTMLImageElement>(`[data-index="${index}"] img`);
	if (!img) return;

	if (!img.complete) {
		await Promise.race([
			new Promise<void>((resolve) => {
				img.addEventListener('load', () => resolve(), { once: true });
				img.addEventListener('error', () => resolve(), { once: true });
			}),
			sleep(timeout)
		]);
	}

	if (img.complete && img.naturalWidth) await img.decode().catch(() => {});
};

// Animations :
const animateFlipOpen = async (clickedElement: HTMLElement) => {
	if (!viewerWrapperRef.value) return;

	const state = Flip.getState(clickedElement);

	viewerWrapperRef.value.style.opacity = '1';
	viewerWrapperRef.value.style.display = 'flex';
	viewerWrapperRef.value.appendChild(clickedElement);

	// The clicked picture can still be loading (it's lazy-loaded in the grid). Its wrapper has no
	// explicit width, so its size in the viewer is derived from the image's own intrinsic size; if
	// it isn't loaded yet, Flip reads a collapsed width and the scale animation breaks :
	const clickedImg = clickedElement.querySelector('img');
	if (clickedImg && !clickedImg.complete) {
		await new Promise<void>((resolve) => {
			clickedImg.addEventListener('load', () => resolve(), { once: true });
			clickedImg.addEventListener('error', () => resolve(), { once: true });
		});
	}

	return new Promise<void>((resolve) => {
		Flip.from(state, {
			absolute: true,
			duration: 0.8,
			ease: 'power2.inOut',
			onComplete: () => {
				// Keep the clicked picture until the full size one can be displayed (no empty frame) :
				waitForPicture(projectMinimapStore.value.initialIndex).then(() => {
					isOpening.value = false;
					$projectMinimap.setKey('isFlipping', false);
					(projectMinimapStore.value.clickedParentElement as HTMLElement)?.appendChild(clickedElement);
					resolve();
				});
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

		// Animation of the Zoom container :
		gsap.to(zoomContainer.value, {
			clipPath: 'inset(100% 0% 0% 0%)',
			duration: 0.8,
			ease: 'power3.inOut'
		});

		await slideshowRef.value?.animateOut();
		isVisible.value = false;

		if (isSameImage && clickedElement && clickedParentElement && viewerWrapperRef.value) {
			const pictureWrapper = viewerWrapperRef.value.querySelector('.picture-wrapper') as HTMLElement;
			const initialPictureWrapper = clickedParentElement.querySelector('.picture-wrapper') as HTMLElement;

			if (initialPictureWrapper && pictureWrapper) {
				await animateFlipClose(pictureWrapper, initialPictureWrapper, clickedParentElement as HTMLElement);
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
		if (zoomContainer.value) gsap.set(zoomContainer.value, { clearProps: 'all' });
	}
};

// Watchers :
watch(
	() => projectMinimapStore.value.isOpen,
	async (isOpen) => {
		if (isOpen) {
			const { clickedElement, currentIndex } = projectMinimapStore.value;

			hasBeenOpened.value = true;
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

			// Animation of the Zoom container :
			const zoomInnerCtn = zoomContainer.value?.querySelector('.zoom-inner-container');
			const zoomDots = zoomInnerCtn?.querySelectorAll('button');
			const zoomThumb = zoomContainer.value?.querySelector('.custom-thumb');
			const zoomIndicator = zoomContainer.value?.querySelector('.indicator');

			const tlZoom = gsap.timeline();

			tlZoom.from(
				zoomContainer.value,
				{ clipPath: 'inset(100% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut' },
				0
			);

			if (zoomInnerCtn) {
				tlZoom.from(zoomInnerCtn, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.4);
			}

			if (zoomDots) {
				tlZoom.from(zoomDots, { scale: 0, stagger: 0.1, duration: 0.8, ease: 'power2.inOut' }, 0.45);
			}

			if (zoomIndicator) {
				tlZoom.from(zoomIndicator, { scaleX: 0, duration: 0.8, ease: 'power2.inOut' }, 0.5);
			}

			if (zoomThumb) {
				tlZoom.from(zoomThumb, { scale: 0.85, opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0.575);
			}

			if (clickedElement) await animateFlipOpen(clickedElement as HTMLElement);
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
		@wheel.passive="onWheel"
	>
		<div class="overlay" />
		<Button
			ref="themeCtaRef"
			class="theme-cta"
			:class="{ 'is-dark': isDarkTheme }"
			:aria-label="$t(isDarkTheme ? 'switchToLightTheme' : 'switchToDarkTheme')"
			@click="onToggleDarkTheme"
		>
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
				<div ref="viewerWrapperRef" class="picture-inner-wrapper">
					<div
						v-if="!isOpening && hasBeenOpened"
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
			>
				<Button
					v-for="(picture, index) in pictures"
					:key="index"
					class="picture-wrapper"
					:data-cursor-label="$t('visualize')"
					:class="{ 'is-current': index === currentSlide }"
					:style="{ aspectRatio: getAspectRatio(picture) }"
					@click="goToSlide(index)"
				>
					<Image :src="picture" object-fit="contain" :sizes="[{ desktop: '10vw' }, '150px']" />
				</Button>
			</Slideshow>
		</div>
		<div ref="preloadRef" class="preload-container" aria-hidden="true">
			<div v-for="index in preloadedIndexes" :key="index" :data-index="index">
				<Image
					:src="pictures[index]"
					object-fit="contain"
					loading="eager"
					:fetchpriority="index === projectMinimapStore.currentIndex ? 'high' : 'low'"
					alt=""
				/>
			</div>
		</div>
		<div ref="zoomContainer" class="zoom-container hide-mobile-tablet">
			<div class="zoom-inner-container">
				<div class="indicator"></div>
				<Button
					v-for="value in [0.5, 1, 1.5, 2]"
					:key="value"
					:class="{ 'is-active': currentPictureZoom === value }"
					:aria-label="`${$t('zoom')} x${value}`"
					@click="onHandlePictureZoom(value)"
				>
					<Icon name="square-small" />
				</Button>
			</div>
			<div class="range-wrapper">
				<input
					v-model.number="currentPictureZoom"
					type="range"
					:aria-label="$t('zoom')"
					min="0.5"
					max="2.0"
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
	inset: 0;
	z-index: 20;
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
		gap: var(--gutter);
		justify-content: space-between;
		padding-block: calc(var(--header-height) + (var(--gutter) * 2));
	}
}

.overlay {
	position: absolute;
	inset: 0;
	background: $white;
	opacity: 0;
	transition:
		opacity 0.4s $power2InOut,
		background 0.4s $power2InOut;
}

.theme-cta {
	position: absolute;
	top: var(--gutter);
	right: var(--gutter);
	z-index: 1;
	height: var(--header-height);
	aspect-ratio: 1/1;
	overflow: hidden;
	background: $whiteChoco;
	border-radius: var(--border-radius);

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
		width: 100%;
		height: 100%;
	}

	:deep(.picture-wrapper) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;

		// The picture is contained in the whole viewer, so its size doesn't depend on the resolution of the
		// loaded file (the clicked one is smaller than the full size one, which made the picture jump) :
		img {
			width: 100%;
			height: 100%;
		}

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
			flex: 0 0 fluidSize(150px, 85px);
			min-width: 0;
			height: fit-content;
		}

		@include mq(desktop) {
			width: 100%;
		}
	}
}

.preload-container {
	position: absolute;
	visibility: hidden;
	width: 0;
	height: 0;
	overflow: hidden;
}

.zoom-container {
	position: absolute;
	bottom: 0;
	left: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	width: fluidSize(280px, 240px);
	height: var(--header-height);
	padding-inline: fluidSize(24px, 20px);
	margin: var(--gutter);
	background: $whiteChoco;
	border-radius: var(--border-radius);
	transform: translate3d(-50%, 0, 0);
}

.zoom-inner-container {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	pointer-events: none;

	.indicator {
		position: absolute;
		top: 50%;
		left: 0;
		width: 100%;
		height: 1px;
		background: rgba($khaki, 0.25);
		transform: translate3d(0, -50%, 0);
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
	width: calc(100% - fluidSize(20px, 16px));
	height: 22px;
	transform: translate3d(-50%, -50%, 0);

	& > input[type='range'] {
		position: relative;
		width: 100%;
		height: 100%;
		appearance: none;
		cursor: pointer;
		background: transparent;

		&:focus {
			outline: none;
		}

		body:is(.keyboard-focus, .a11y-active) &:focus-visible {
			outline: 2px solid #4285f4;
			outline: 2px solid -webkit-focus-ring-color;
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
			width: 0;
			height: 0;
			margin-top: -1px;
			appearance: none;
			background: transparent;
			border: none;
		}

		&::-moz-range-thumb {
			width: 0;
			height: 0;
			background: transparent;
			border: none;
		}
	}
}

.custom-thumb-wrapper {
	position: absolute;
	top: 50%;
	left: 50%;
	z-index: 2;
	width: calc(100% - fluidSize(20px, 16px));
	transform: translate3d(-50%, -50%, 0);
}

.custom-thumb {
	position: absolute;
	top: 50%;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 22px;
	pointer-events: none;
	background: $eerieBlack;
	border-radius: 3px;
	transform: translate3d(0, -50%, 0);
	transition: left 0s;

	&.is-smooth {
		transition: left 0.4s $power2Out;
	}

	span {
		@include roobert-12-uppercase;

		display: flex;
		margin-block-end: 1px;
		color: $white;
	}
}
</style>
