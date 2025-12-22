<script setup lang="ts" generic="T">
import { useDebounceFn, useIntersectionObserver, useResizeObserver, useTemplateRefsList } from '@vueuse/core';
import gsap from 'gsap';
import type Lenis from 'lenis';
import { useLenis } from 'lenis/vue';
import { computed, nextTick, onUnmounted, reactive, ref, useTemplateRef, watch, watchEffect } from 'vue';

import { Motion } from '#utils/Motion.ts';

import { useGSAP } from '#composables/useGSAP.ts';

// Props :
const {
	items,
	speed = 40,
	trackVisible,
	pauseOnHover,
	scrollSpeed,
	initialDuplicateCount = 1,
	noFill,
	inert
} = defineProps<{
	items: T[];
	/**
	 * The speed of the animation in px/s.
	 */
	speed?: number;
	/**
	 * When true, the component will track the visibility of each item with
	 * an IntersectionObserver.
	 */
	trackVisible?: boolean;
	/**
	 * When true, the animation will pause when the mouse hovers over the
	 * component.
	 */
	pauseOnHover?: boolean;
	/**
	 * When true, the component will be inert.
	 */
	inert?: boolean;
	/**
	 * When true, the animation will play faster when the user is scrolling
	 */
	scrollSpeed?: boolean;
	/**
	 * Speed up on scroll
	 */
	speedUpOnScroll?: boolean;
	/**
	 * The number of initial items to duplicate. This is useful to avoid a
	 * jump when the animation starts.
	 * @default 1
	 */
	initialDuplicateCount?: number;
	/**
	 * When true, the animation will only play when there is enough items to
	 * fill the container.
	 */
	noFill?: boolean;
}>();

// Model :
const playing = defineModel<boolean>('playing', { default: true });

// Refs :
const containerRef = useTemplateRef('container');
const listRef = useTemplateRef('list');
const slideRefs = useTemplateRefsList<HTMLLIElement>();

const visibleTracker = reactive(new Set<number>());

const extraItems = ref(noFill ? 0 : Math.round(initialDuplicateCount));
const duplicateCount = computed(() => Math.ceil(extraItems.value / items.length));

const startKey = 'left';
const endKey = 'right';
const sizeKey = 'inlineSize';
const lengthKey = 'width';
const percentKey = 'xPercent';

const hovering = ref(false);
const scrolling = ref(false);

// Variables :
let gap = 0;
let ctnSize = 0;
let listSize = 0;
let inView = false;
let initialized = false;
let tl: gsap.core.Timeline | null = null;

const rate = new Motion(1);
rate.on('change', (r) => tl?.timeScale(r));

const gCtx = useGSAP(containerRef);

const lenis = scrollSpeed ? useLenis() : ref();

// Utils :
function updateExtraItems() {
	const container = containerRef.value;
	if (!container || items.length === 0) return;

	const allSlides = container.querySelectorAll('.ul-marquee:first-of-type > .li-marquee');
	const firstDuplicate = container.querySelector('.ul-marquee:nth-of-type(2) > .li-marquee:first-of-type');

	if (!allSlides.length || !firstDuplicate) return;

	const lastEnd = allSlides[allSlides.length - 1]!.getBoundingClientRect()[endKey];
	const duplicateStart = firstDuplicate.getBoundingClientRect()[startKey];

	gap = duplicateStart - lastEnd;

	const itemSizes = Array.from(allSlides).map((slide) => slide.getBoundingClientRect()[lengthKey]);

	let index = 0;
	let extraCount = 0;
	let size = listSize + gap;

	while (size - itemSizes[index % itemSizes.length] + gap < ctnSize && index < 20) {
		while (size - itemSizes[index % itemSizes.length] + gap < ctnSize) {
			size += itemSizes[extraCount % itemSizes.length] + gap;
			extraCount++;
		}
		index++;
	}

	extraItems.value = extraCount;
}

function updateAnimation() {
	const items = slideRefs.value;

	tl = gsap.timeline({
		repeat: -1,
		paused: !inView || rate.value === 0,
		defaults: { ease: 'none' }
	});

	const rect = containerRef.value!.querySelector('.marquee-inner')!.getBoundingClientRect();
	const start = rect[startKey];
	const totalSize = rect[lengthKey];

	const startIndex = 0;
	const endIndex = 1;

	items.forEach((item, i) => {
		const itemRect = item.getBoundingClientRect();
		const size = itemRect[lengthKey];

		const distanceToStart = itemRect[startKey] - start;
		const distanceToLoop = distanceToStart + size;
		const distanceToVisible = ctnSize - distanceToStart;

		const distances = [-distanceToLoop, -distanceToLoop + totalSize] as const;

		let visible = false;

		const updateVisible = (flag: boolean) => {
			if (flag) visibleTracker.add(i);
			else visibleTracker.delete(i);
			visible = flag;
		};

		updateVisible(distanceToStart < ctnSize);

		const to: gsap.TweenVars = {
			[percentKey]: (distances[startIndex] / size) * 100,
			duration: Math.abs(distances[startIndex]) / speed
		};

		const fromTo: gsap.TweenVars = {
			[percentKey]: 0,
			duration: Math.abs(distances[endIndex]) / speed,
			immediateRender: false
		};

		if (visible) {
			to.onComplete = function () {
				updateVisible(false);
			};
			fromTo.onUpdate = function () {
				if (!visible && this.progress() >= 1 - distanceToVisible / distances[endIndex]) {
					updateVisible(true);
				}
			};
		} else {
			to.onStart = function () {
				updateVisible(false);
			};
			to.onUpdate = function () {
				if (!visible && this.progress() >= distanceToVisible / distances[startIndex]) {
					updateVisible(true);
				}
			};
		}

		tl!.add(
			gsap
				.timeline({ defaults: { ease: 'none' } })
				.to(item, to)
				.fromTo(item, { [percentKey]: (distances[endIndex] / size) * 100 }, fromTo),
			0
		);
	});

	tl.timeScale(rate.value);
	tl.progress(1, true).progress(0, true);

	return tl;
}

const onScroll = (instance: Lenis) => {
	scrolling.value = !!instance.isScrolling && Math.abs(instance.velocity) > 10;
};

const updateTicker = async () => {
	extraItems.value = Math.round(noFill ? 0 : initialDuplicateCount);
	gCtx.context?.revert();

	await nextTick();

	if (!noFill && items.length > 0) {
		updateExtraItems();
		await nextTick();
	}

	const inner = containerRef.value?.querySelector('.marquee-inner');
	const isOverflowing = (inner?.getBoundingClientRect()[lengthKey] ?? 0) > ctnSize;

	if (isOverflowing) gCtx.add(updateAnimation);
};

const debouncedUpdateTicker = useDebounceFn(updateTicker, 300);

// Setup resize observer to update duplicates and timing when window size changes,
// but also when the inner elements change size (like when a font is loaded in a
// text ticker, forcing elements to reflow)
useResizeObserver([containerRef, listRef], (entries) => {
	let newCtnSize = ctnSize;
	let newListSize = listSize;

	entries.forEach((entry) => {
		if (entry.target === containerRef.value) newCtnSize = entry.borderBoxSize[0][sizeKey];
		else if (entry.target === listRef.value) newListSize = entry.borderBoxSize[0][sizeKey];
	});

	if (ctnSize !== newCtnSize || listSize !== newListSize) {
		ctnSize = newCtnSize;
		listSize = newListSize;

		if (!initialized) {
			updateTicker();
			initialized = true;
		} else {
			debouncedUpdateTicker();
		}
	}
});

// Watchers :
watchEffect(() => {
	if (!playing.value) rate.set(0);
	else {
		if (tl?.paused()) tl?.play();
		if (scrolling.value) rate.set(3);
		else if (pauseOnHover && hovering.value) rate.set(0.3);
		else rate.set(1);
	}
});

// Intersection observer :
useIntersectionObserver(containerRef, ([entry]) => {
	if (entry.isIntersecting) {
		inView = true;
		if (rate.value > 0) tl?.play();
		scrollSpeed && lenis.value?.on('scroll', onScroll);
	} else {
		inView = false;
		tl?.pause();
		scrollSpeed && lenis.value?.off('scroll', onScroll);
	}
});

// Detach :
onUnmounted(() => {
	rate.clean();
	lenis.value?.off('scroll', onScroll);
});
</script>

<template>
	<div
		ref="container"
		class="marquee-wrapper"
		:aria-hidden="true"
		@mouseenter="hovering = true"
		@mouseleave="hovering = false"
	>
		<div class="marquee-inner" :inert>
			<ul ref="list" class="ul-marquee">
				<li
					v-for="(item, i) in items"
					ref="slideRefs"
					:key="i"
					class="li-marquee"
					:aria-hidden="!trackVisible || !visibleTracker.has(i)"
				>
					<slot name="item" :index="i" :item="item" :visible="trackVisible && visibleTracker.has(i)" />
				</li>
			</ul>
			<ul v-for="i in duplicateCount" :key="`dup-${i}`" class="ul-marquee" aria-hidden="true">
				<li
					v-for="j in Math.min(items.length, extraItems - (i - 1) * items.length)"
					:key="`dup-${i}-${j}`"
					ref="slideRefs"
					class="li-marquee"
					:aria-hidden="!trackVisible || !visibleTracker.has(items.length * i + j - 1)"
				>
					<slot
						name="item"
						duplicate
						:index="items.length * i + j - 1"
						:item="items[j - 1]"
						:visible="trackVisible && visibleTracker.has(items.length * i + j - 1)"
					/>
				</li>
			</ul>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.marquee-wrapper {
	--tx: -50%;

	position: relative;
	// overflow: hidden;
	width: 100%;
}

.marquee-inner {
	position: relative;
	display: inline-flex;
	gap: var(--marquee-gap, 0);
	align-items: center;
	width: max-content;
	height: 100%;
}

.ul-marquee {
	position: relative;
	display: inline-flex;
	flex-shrink: 0;
	gap: var(--marquee-gap, 0);
	align-items: center;
	padding-inline-start: var(--marquee-gap, 0);
}

.li-marquee {
	position: relative;
	flex-shrink: 0;
	width: var(--marquee-size, fit-content);
}
</style>
