<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { gsap } from 'gsap';
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

import { breakPointsNoUnits } from '#utils/breakpoints.ts';

// Props & Model :
const modelValue = defineModel<number>({ default: 0 });

const props = defineProps<{
	itemSelector?: string;
	enabled?: boolean;
	isHidden?: boolean;
}>();

// Refs :
const slideshowContainerRef = useTemplateRef('slideshowContainerRef');
const slideshowWrapperRef = useTemplateRef('slideshowWrapperRef');
const activeIndicatorRef = useTemplateRef('activeIndicatorRef');

// State :
const isGrabbing = ref(false);
const isDesktop = ref(true);
const isMoving = ref(false);

// Cache for slides and their dimensions (avoids repeated DOM queries) :
let slidesCache: HTMLElement[] = [];
let slidesDimensionsCache: Array<{ size: number; pos: number }> = [];
let containerSizeCache = 0;

// Carousel logic:
let startPos = 0;
let startTranslate = 0;
let currentTranslate = 0;
let isDragging = false;
let velocity = 0;
let lastPos = 0;
let lastTime = 0;
let didMove = false;
let axis = 'x';

const dragThreshold = 5;

// GSAP Ticker for velocity calculation (synced with RAF) :
let tickerVelocity = 0;
let tickerLastPos = 0;
let tickerActive = false;

const velocityTicker = () => {
	if (!isDragging) return;

	const pos = isDesktop.value ? lastPos : lastPos;
	const delta = pos - tickerLastPos;

	// Moving average for smooth velocity :
	tickerVelocity = tickerVelocity * 0.7 + delta * 0.3;
	tickerLastPos = pos;
};

// Methods:
const initSlidesCache = () => {
	if (!slideshowWrapperRef.value) return;

	// Query DOM once and cache all slides :
	slidesCache = Array.from(
		slideshowWrapperRef.value.querySelectorAll(props.itemSelector || ':scope > .picture-wrapper')
	) as HTMLElement[];

	// Pre-calculate dimensions :
	updateSlideDimensionsCache();
};

const updateSlideDimensionsCache = () => {
	if (!slideshowContainerRef.value) return;

	// Cache container size
	containerSizeCache = isDesktop.value
		? slideshowContainerRef.value.offsetHeight
		: slideshowContainerRef.value.offsetWidth;

	// Pre-calculate all slide dimensions and positions :
	slidesDimensionsCache = slidesCache.map((slide) => ({
		size: isDesktop.value ? slide.offsetHeight : slide.offsetWidth,
		pos: isDesktop.value ? slide.offsetTop : slide.offsetLeft
	}));
};

const updateActiveIndicator = (immediate = false) => {
	if (!activeIndicatorRef.value || !slideshowWrapperRef.value) return;

	const activeSlide = slidesCache[modelValue.value];
	if (!activeSlide) return;

	// Use cached dimensions :
	const { pos } = slidesDimensionsCache[modelValue.value];
	const slideWidth = activeSlide.offsetWidth;
	const slideHeight = activeSlide.offsetHeight;

	gsap.killTweensOf(activeIndicatorRef.value);

	gsap.to(activeIndicatorRef.value, {
		width: slideWidth + 12,
		height: slideHeight + 12,
		x: isDesktop.value ? -6 : pos - 6,
		y: isDesktop.value ? pos - 6 : '-50%',
		duration: immediate ? 0 : 0.6,
		ease: 'power3.out',
		overwrite: 'auto'
	});
};

const scrollToSlide = (index: number, immediate = false) => {
	if (!slideshowWrapperRef.value || index < 0 || index >= slidesCache.length) return;

	// Use cached dimensions (no DOM queries) :
	const { size, pos } = slidesDimensionsCache[index];
	const target = containerSizeCache / 2 - (pos + size / 2);
	currentTranslate = target;

	gsap.to(slideshowWrapperRef.value, {
		[axis]: target,
		duration: immediate ? 0 : 0.8,
		ease: 'power3.out',
		onUpdate: () => {
			if (!slideshowWrapperRef.value) return;
			currentTranslate = gsap.getProperty(slideshowWrapperRef.value, axis) as number;
		}
	});

	modelValue.value = index;
	updateActiveIndicator(immediate);
};

const findNearestSlide = () => {
	const center = containerSizeCache / 2;
	let closestIndex = 0;
	let minDistance = Infinity;

	// Use cached dimensions for calculation :
	slidesDimensionsCache.forEach(({ size, pos }, index) => {
		const slideCenter = currentTranslate + pos + size / 2;
		const distance = Math.abs(center - slideCenter);

		if (distance < minDistance) {
			minDistance = distance;
			closestIndex = index;
		}
	});

	return closestIndex;
};

const onPointerDown = (e: PointerEvent) => {
	if (!props.enabled) return;

	const target = e.target as HTMLElement;
	if (target && target.setPointerCapture) target.setPointerCapture(e.pointerId);

	isDragging = true;
	isGrabbing.value = true;
	startPos = isDesktop.value ? e.clientY : e.clientX;

	// Read actual position to avoid jumps from unfinished animations :
	currentTranslate = gsap.getProperty(slideshowWrapperRef.value, axis) as number;
	startTranslate = currentTranslate;
	lastPos = startPos;
	lastTime = performance.now();
	velocity = 0;
	didMove = false;
	isMoving.value = false;

	// Initialize ticker for smooth velocity tracking :
	tickerVelocity = 0;
	tickerLastPos = startPos;
	if (!tickerActive) {
		gsap.ticker.add(velocityTicker);
		tickerActive = true;
	}

	gsap.killTweensOf(slideshowWrapperRef.value);

	// Events:
	window.addEventListener('pointermove', onPointerMove, { passive: false });
	window.addEventListener('pointerup', onPointerUp);
	window.addEventListener('pointercancel', onPointerUp);
};

const onPointerMove = (e: PointerEvent) => {
	if (!isDragging || !slideshowWrapperRef.value) return;

	const pos = isDesktop.value ? e.clientY : e.clientX;
	const delta = pos - startPos;

	if (!didMove && Math.abs(delta) > dragThreshold) {
		didMove = true;
		isMoving.value = true;
	}

	const targetTranslate = startTranslate + delta;

	// Update currentTranslate with resistance if out of bounds :
	const wrapperSize = isDesktop.value
		? slideshowWrapperRef.value.offsetHeight
		: slideshowWrapperRef.value.offsetWidth;
	const minTranslate = containerSizeCache / 2 - (wrapperSize - 50);
	const maxTranslate = containerSizeCache / 2 + 50;

	if (targetTranslate > maxTranslate) {
		currentTranslate = maxTranslate + (targetTranslate - maxTranslate) * 0.3;
	} else if (targetTranslate < minTranslate) {
		currentTranslate = minTranslate + (targetTranslate - minTranslate) * 0.3;
	} else {
		currentTranslate = targetTranslate;
	}

	gsap.set(slideshowWrapperRef.value, {
		[axis]: currentTranslate
	});

	// Simplified update for ticker :
	lastPos = pos;
	lastTime = performance.now();

	// Use ticker velocity instead of manual calculation :
	velocity = tickerVelocity;
};

const onPointerUp = (e: PointerEvent) => {
	if (!isDragging) return;

	const target = e.target as HTMLElement;
	if (target && target.releasePointerCapture) target.releasePointerCapture(e.pointerId);

	isDragging = false;
	isGrabbing.value = false;

	// Stop ticker
	if (tickerActive) {
		gsap.ticker.remove(velocityTicker);
		tickerActive = false;
	}

	window.removeEventListener('pointermove', onPointerMove);
	window.removeEventListener('pointerup', onPointerUp);
	window.removeEventListener('pointercancel', onPointerUp);

	if (slidesCache.length === 0) return;

	// Kill all animations:
	gsap.killTweensOf(slideshowWrapperRef.value);
	gsap.killTweensOf(activeIndicatorRef.value);

	let targetIndex = findNearestSlide();

	// Improved momentum snapping using ticker velocity :
	if (Math.abs(tickerVelocity) > 0.5) {
		// Adjusted threshold for ticker :
		const slideSize = slidesDimensionsCache[0]?.size || 0;
		const travelDist = tickerVelocity * 15;
		const slideOffset = Math.round(travelDist / slideSize);

		if (tickerVelocity > 0) {
			targetIndex = Math.max(0, targetIndex - Math.abs(slideOffset));
		} else {
			targetIndex = Math.min(slidesCache.length - 1, targetIndex + Math.abs(slideOffset));
		}
	}

	scrollToSlide(targetIndex);

	setTimeout(() => {
		didMove = false;
		isMoving.value = false;
	}, 50);
};

// Animations :
const animateInto = () => {
	if (!slideshowWrapperRef.value) return;

	const tl = gsap.timeline();

	tl.from(slidesCache, {
		clipPath: 'inset(100% 0% 0% 0%)',
		duration: 1.2,
		stagger: 0.04,
		ease: 'power3.inOut'
	});

	if (activeIndicatorRef.value) {
		tl.fromTo(
			activeIndicatorRef.value,
			{ opacity: 0, scale: 0.9 },
			{ opacity: 1, scale: 1, duration: 0.6, ease: 'power2.inOut' },
			Math.max(0.8, modelValue.value * 0.4)
		);
	}

	return tl;
};

const animateOut = () => {
	if (!slideshowWrapperRef.value) return;

	const tl = gsap.timeline({
		onComplete: () => {
			gsap.set(slidesCache, { clearProps: 'clipPath' });
			if (activeIndicatorRef.value) gsap.set(activeIndicatorRef.value, { clearProps: 'opacity' });
		}
	});

	if (activeIndicatorRef.value) {
		tl.to(activeIndicatorRef.value, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0);
	}

	tl.to(
		slidesCache,
		{
			clipPath: 'inset(0% 0% 100% 0%)',
			duration: 0.8,
			stagger: 0.025,
			ease: 'power3.inOut'
		},
		0
	);

	return tl;
};

// Resize observers :
useResizeObserver(slideshowContainerRef, () => {
	isDesktop.value = window.innerWidth >= breakPointsNoUnits.desktop;

	if (slideshowWrapperRef.value) {
		gsap.set(slideshowWrapperRef.value, { clearProps: 'all' });
	}

	axis = isDesktop.value ? 'y' : 'x';
	updateSlideDimensionsCache();

	nextTick(() => {
		scrollToSlide(modelValue.value, true);
	});
});

// Watchers :
watch(modelValue, (newVal, oldVal) => {
	if (newVal !== oldVal) {
		updateActiveIndicator();
	}
});

// Attach & Detach :
onMounted(() => {
	initSlidesCache();
});

onUnmounted(() => {
	if (tickerActive) gsap.ticker.remove(velocityTicker);

	window.removeEventListener('pointermove', onPointerMove);
	window.removeEventListener('pointerup', onPointerUp);
});

// Expose :
defineExpose({
	scrollToSlide,
	next: () => {
		const nextIndex = modelValue.value + 1;
		if (nextIndex < slidesCache.length) scrollToSlide(nextIndex);
	},
	prev: () => {
		const prevIndex = modelValue.value - 1;
		if (prevIndex >= 0) scrollToSlide(prevIndex);
	},
	isMoving,
	refreshCache: initSlidesCache,
	animateInto,
	animateOut
});
</script>

<template>
	<div class="slideshow-container" ref="slideshowContainerRef" @pointerdown="onPointerDown">
		<div
			class="slideshow-wrapper"
			ref="slideshowWrapperRef"
			:class="{
				'can-grab': enabled,
				'is-grabbing': isGrabbing,
				'is-hidden': isHidden
			}"
		>
			<div class="active-indicator" ref="activeIndicatorRef" />
			<slot />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.slideshow-container {
	position: relative;
	touch-action: none;
	height: 100%;
	width: 100%;
}

.slideshow-wrapper {
	display: flex;
	gap: $gap;
	transition: opacity 0.4s $power2InOut;
	will-change: transform;

	&.can-grab {
		cursor: grab;
	}

	&.is-grabbing {
		cursor: grabbing;
	}

	@include mq($until: desktop) {
		align-items: center;
		min-height: fluidSize(150px, 125px, null, desktop);
	}

	@include mq(desktop) {
		flex-direction: column;
		height: auto;
		width: 100%;

		&.is-hidden {
			opacity: 0;
			pointer-events: none;
		}
	}
}

.active-indicator {
	position: absolute;
	z-index: 2;
	left: 0;
	border: 2px solid $khaki;
	pointer-events: none;
	background: rgba($khaki, 0.25);

	@include mq($until: desktop) {
		top: 50%;
	}

	@include mq(desktop) {
		top: 0;
	}

	:global(.is-dark) & {
		border-color: $white;
	}
}
</style>
