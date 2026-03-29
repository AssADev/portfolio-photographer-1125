<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import gsap from 'gsap';
import { nextTick, onMounted, onUnmounted, ref, shallowRef } from 'vue';

import { isTouchDevice } from '#utils/device.ts';

import CursorProjectsItem from '#components/partials/CursorProjectsItem.vue';

import type { StoryblokAsset } from '#types/component-types-sb.js';

import { $global } from '#stores/global.ts';

// Types :
type ProjectItem = {
	id: number;
	x: number;
	y: number;
	rotation: number;
	image?: StoryblokAsset;
	component?: InstanceType<typeof CursorProjectsItem> | null;
};

// Props :
const { images } = defineProps<{
	images: StoryblokAsset[];
}>();

// Refs :
const globalStore = useStore($global);
const spawnerEl = ref<HTMLElement | null>(null);
const items = shallowRef<ProjectItem[]>([]);

// Config :
const config = {
	spawnDistance: 40,
	spawnTime: 800,
	maxRotation: 18
};

// State :
const mouse = { x: 0, y: 0 };
const lastMouse = { x: 0, y: 0 };
const scroll = { last: 0, current: 0 };

const pos = {
	dx: 0,
	dy: 0,
	now: 0,
	speed: 0,
	accumulator: 0
};

let idCounter = 0;
let imageIndex = 0;
let lastSpawnTime = 0;
let isHovering = false;
let hasMouseMoved = false;
let isWindowFocused = true;
let currentElement: Element | null = null;

// Methods :
const updateHoverState = () => {
	currentElement = document.elementFromPoint(mouse.x, mouse.y);
	isHovering = !!currentElement?.closest('[data-cursor-projects]');
};

const handleMouseMove = (e: MouseEvent) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;

	if (!hasMouseMoved) hasMouseMoved = true;
};

const handleWindowBlur = () => {
	isWindowFocused = false;
};

const handleWindowFocus = () => {
	isWindowFocused = true;
};

const handleVisibilityChange = () => {
	isWindowFocused = !document.hidden;
};

const spawnItem = (images: StoryblokAsset[]) => {
	const id = idCounter++;
	const rotation = Math.random() * config.maxRotation * 2 - config.maxRotation;
	const currentImage = images[imageIndex];

	imageIndex = (imageIndex + 1) % images.length;

	items.value = [
		...items.value,
		{
			id,
			x: mouse.x,
			y: mouse.y + window.scrollY,
			rotation,
			image: currentImage
		}
	];

	nextTick(() => {
		const el = items.value.find((i) => i.id === id)?.component?.el;
		const tl = gsap.timeline();

		if (el) {
			tl.fromTo(
				el,
				{ scale: 0, rotation: rotation + 15 },
				{
					scale: 1,
					rotation: rotation,
					duration: 1.25,
					ease: 'circ.out'
				}
			);

			tl.to(
				el,
				{
					scale: 0,
					rotation: rotation - 10,
					duration: 0.4,
					ease: 'power2.inOut',
					onComplete: () => {
						items.value = items.value.filter((i) => i.id !== id);
					}
				},
				'-=0.25'
			);
		}
	});
};

const tick = () => {
	if (spawnerEl.value) gsap.set(spawnerEl.value, { y: -window.scrollY });

	// Update hover state even if mouse hasn't moved
	updateHoverState();

	if (
		!isWindowFocused ||
		!isHovering ||
		!hasMouseMoved ||
		globalStore.value.isContactToggled ||
		globalStore.value.isMenuToggled
	) {
		return;
	}

	// Calculate movement from mouse position :
	pos.dx = mouse.x - lastMouse.x;
	pos.dy = mouse.y - lastMouse.y;

	// Add scroll movement to simulate relative motion :
	scroll.current = window.scrollY - scroll.last;
	pos.dy += scroll.current;

	pos.speed = Math.sqrt(pos.dx * pos.dx + pos.dy * pos.dy);
	pos.now = performance.now();
	pos.accumulator += pos.speed;

	if (pos.accumulator > config.spawnDistance) {
		spawnItem(images);
		pos.accumulator = 0;
		lastSpawnTime = pos.now;
	} else if (pos.now - lastSpawnTime > config.spawnTime) {
		spawnItem(images);
		lastSpawnTime = pos.now;
		pos.accumulator = 0;
	}

	lastMouse.x = mouse.x;
	lastMouse.y = mouse.y;
	scroll.last = window.scrollY;
};

onMounted(() => {
	if (isTouchDevice()) return;

	// Initialize mouse position
	const initMousePosition = (e: MouseEvent) => {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
		lastMouse.x = e.clientX;
		lastMouse.y = e.clientY;
		hasMouseMoved = true;
		window.removeEventListener('mousemove', initMousePosition);
	};

	window.addEventListener('mousemove', initMousePosition, { once: true });
	window.addEventListener('mousemove', handleMouseMove);
	window.addEventListener('blur', handleWindowBlur);
	window.addEventListener('focus', handleWindowFocus);

	document.addEventListener('visibilitychange', handleVisibilityChange);

	// Initialize scroll position
	scroll.last = window.scrollY;

	// Ticker :
	gsap.ticker.add(tick);
});

onUnmounted(() => {
	window.removeEventListener('mousemove', handleMouseMove);
	window.removeEventListener('blur', handleWindowBlur);
	window.removeEventListener('focus', handleWindowFocus);

	document.removeEventListener('visibilitychange', handleVisibilityChange);

	// Ticker :
	gsap.ticker.remove(tick);
});
</script>

<template>
	<div class="cursor-projects-container">
		<div ref="spawnerEl" class="cursor-projects-items-wrapper">
			<CursorProjectsItem
				v-for="item in items"
				:key="item.id"
				:ref="(el) => (item.component = el as InstanceType<typeof CursorProjectsItem> | null)"
				:data-id="item.id"
				:x="item.x"
				:y="item.y"
				:rotation="item.rotation"
				:image="item.image"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.cursor-projects-container {
	position: fixed;
	z-index: 10;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
}

.cursor-projects-items-wrapper {
	position: absolute;
	inset: 0;
	will-change: transform;
}
</style>
