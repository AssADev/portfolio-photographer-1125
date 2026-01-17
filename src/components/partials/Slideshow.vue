<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
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

// Carousel logic :
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

// Methods :
const getSlideDimensions = (slide: HTMLElement) => {
	return isDesktop.value
		? { size: slide.offsetHeight, pos: slide.offsetTop }
		: { size: slide.offsetWidth, pos: slide.offsetLeft };
};

const getContainerSize = () => {
	if (!slideshowContainerRef.value) return 0;
	return isDesktop.value ? slideshowContainerRef.value.offsetHeight : slideshowContainerRef.value.offsetWidth;
};

const getAllSlides = () => {
	if (!slideshowWrapperRef.value) return [];
	return Array.from(
		slideshowWrapperRef.value.querySelectorAll(props.itemSelector || ':scope > .picture-wrapper')
	) as HTMLElement[];
};

const updateActiveIndicator = (immediate = false) => {
	if (!activeIndicatorRef.value || !slideshowWrapperRef.value) return;

	const slides = getAllSlides();
	const activeSlide = slides[modelValue.value];
	if (!activeSlide) return;

	const { pos } = getSlideDimensions(activeSlide);
	const slideWidth = activeSlide.offsetWidth;
	const slideHeight = activeSlide.offsetHeight;

	gsap.killTweensOf(activeIndicatorRef.value);

	gsap.to(activeIndicatorRef.value, {
		width: slideWidth + 10,
		height: slideHeight + 10,
		x: isDesktop.value ? -5 : pos - 5,
		y: isDesktop.value ? pos - 5 : '-50%',
		duration: immediate ? 0 : 0.6,
		ease: 'power3.out',
		overwrite: 'auto'
	});
};

const scrollToSlide = (index: number, immediate = false) => {
	if (!slideshowWrapperRef.value || !slideshowContainerRef.value) return;

	const slides = getAllSlides();
	if (!slides[index]) return;

	const slide = slides[index];
	const { size, pos } = getSlideDimensions(slide);
	const containerSize = getContainerSize();

	const target = containerSize / 2 - (pos + size / 2);
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
	const slides = getAllSlides();
	const containerSize = getContainerSize();
	const center = containerSize / 2;

	let closestIndex = 0;
	let minDistance = Infinity;

	slides.forEach((slide, index) => {
		const { size, pos } = getSlideDimensions(slide);
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

	isDragging = true;
	isGrabbing.value = true;
	startPos = isDesktop.value ? e.clientY : e.clientX;

	// Read actual position to avoid jumps from unfinished animations
	currentTranslate = gsap.getProperty(slideshowWrapperRef.value, axis) as number;
	startTranslate = currentTranslate;
	lastPos = startPos;
	lastTime = Date.now();
	velocity = 0;
	didMove = false;
	isMoving.value = false;

	gsap.killTweensOf(slideshowWrapperRef.value);

	// Events :
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

	// Update currentTranslate with resistance if out of bounds
	const containerSize = getContainerSize();
	const wrapperSize = isDesktop.value
		? slideshowWrapperRef.value.offsetHeight
		: slideshowWrapperRef.value.offsetWidth;
	const minTranslate = containerSize / 2 - (wrapperSize - 50);
	const maxTranslate = containerSize / 2 + 50;

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

	// Calculate velocity :
	const now = Date.now();
	const dt = now - lastTime;

	if (dt > 0) {
		const instantVelocity = (pos - lastPos) / dt;
		velocity = velocity * 0.8 + instantVelocity * 0.2;
	}

	lastPos = pos;
	lastTime = now;
};

const onPointerUp = () => {
	if (!isDragging) return;

	isDragging = false;
	isGrabbing.value = false;

	window.removeEventListener('pointermove', onPointerMove);
	window.removeEventListener('pointerup', onPointerUp);
	window.removeEventListener('pointercancel', onPointerUp);

	const slides = getAllSlides();
	if (slides.length === 0) return;

	// Kill all animations :
	gsap.killTweensOf(slideshowWrapperRef.value);
	gsap.killTweensOf(activeIndicatorRef.value);

	let targetIndex = findNearestSlide();

	// Improved Momentum snapping :
	if (Math.abs(velocity) > 0.2) {
		const slideSize = isDesktop.value ? slides[0].offsetHeight : slides[0].offsetWidth;
		const travelDist = velocity * 250;
		const slideOffset = Math.round(travelDist / slideSize);

		if (velocity > 0) {
			targetIndex = Math.max(0, targetIndex - Math.abs(slideOffset));
		} else {
			targetIndex = Math.min(slides.length - 1, targetIndex + Math.abs(slideOffset));
		}
	}

	scrollToSlide(targetIndex);

	setTimeout(() => {
		didMove = false;
		isMoving.value = false;
	}, 50);
};

const checkBreakpoint = () => {
	isDesktop.value = window.innerWidth >= breakPointsNoUnits.desktop;

	if (slideshowWrapperRef.value) {
		gsap.set(slideshowWrapperRef.value, { clearProps: 'all' });
	}

	axis = isDesktop.value ? 'y' : 'x';

	nextTick(() => {
		scrollToSlide(modelValue.value, true);
	});
};

const debouncedResize = useDebounceFn(checkBreakpoint, 200);

// Expose methods to parent :
defineExpose({
	scrollToSlide,
	next: () => scrollToSlide((modelValue.value + 1) % getAllSlides().length),
	prev: () => scrollToSlide((modelValue.value - 1 + getAllSlides().length) % getAllSlides().length),
	isMoving
});

// Watchers :
watch(modelValue, (newVal, oldVal) => {
	if (newVal !== oldVal) {
		updateActiveIndicator();
	}
});

// Attach & Detach :
onMounted(() => {
	checkBreakpoint();
	window.addEventListener('resize', debouncedResize);
});

onUnmounted(() => {
	window.removeEventListener('resize', debouncedResize);
	window.removeEventListener('pointermove', onPointerMove);
	window.removeEventListener('pointerup', onPointerUp);
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
		height: 100%;
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
