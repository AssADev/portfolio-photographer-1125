<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import gsap from 'gsap';
import { nextTick, onMounted, onUnmounted, ref, shallowRef } from 'vue';

import { isTouchDevice } from '#utils/device.ts';

import CursorProjectsItem from '#components/partials/CursorProjectsItem.vue';

import { $global } from '#stores/global.ts';

// Types :
type ProjectItem = {
	id: number;
	x: number;
	y: number;
	rotation: number;
	component?: InstanceType<typeof CursorProjectsItem> | null;
};

// Refs :
const globalStore = useStore($global);
const spawnerEl = ref<HTMLElement | null>(null);
const items = shallowRef<ProjectItem[]>([]);

// Config :
const config = {
	maxSpeed: 15,
	intervalFast: 15,
	intervalSlow: 500,
	maxRotation: 18
};

// State :
const mouse = { x: 0, y: 0 };
const lastMouse = { x: 0, y: 0 };

const pos = {
	t: 0,
	dx: 0,
	dy: 0,
	now: 0,
	speed: 0,
	interval: 0
};

let idCounter = 0;
let lastSpawnTime = 0;
let isHovering = false;
let isWindowFocused = true;

// Methods :
const handleMouseMove = (e: MouseEvent) => {
	const target = e.target as HTMLElement;
	isHovering = !!target.closest('[data-cursor-projects]');
	mouse.x = e.clientX;
	mouse.y = e.clientY;

	// Check if mouse is inside the window :
	isWindowFocused = !(
		e.clientX < 0 ||
		e.clientX > window.innerWidth ||
		e.clientY < 0 ||
		e.clientY > window.innerHeight
	);
};

const spawnItem = () => {
	const id = idCounter++;
	const rotation = Math.random() * config.maxRotation * 2 - config.maxRotation;
	items.value = [
		...items.value,
		{
			id,
			x: mouse.x,
			y: mouse.y + window.scrollY,
			rotation
		}
	];
	nextTick(() => {
		const el = items.value.find((i) => i.id === id)?.component?.el;
		// Animation :
		const tl = gsap.timeline();
		if (el) {
			tl.fromTo(
				el,
				{ scale: 0, rotation: rotation + 15 },
				{
					scale: 1,
					rotation: rotation,
					duration: '1.25',
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
	if (!isWindowFocused || !isHovering || globalStore.value.isContactToggled || globalStore.value.isMenuToggled) {
		return;
	}

	// Calculate velocity :
	pos.dx = mouse.x - lastMouse.x;
	pos.dy = mouse.y - lastMouse.y;
	pos.speed = Math.sqrt(pos.dx * pos.dx + pos.dy * pos.dy);
	pos.now = performance.now();

	// Linear interpolation for interval (0 -> Slow Interval, MAX -> Fast Interval) :
	pos.t = Math.min(pos.speed / config.maxSpeed, 1);
	pos.interval = config.intervalSlow - pos.t * (config.intervalSlow - config.intervalFast);

	if (pos.now - lastSpawnTime > pos.interval) {
		spawnItem();
		lastSpawnTime = pos.now;
	}

	lastMouse.x = mouse.x;
	lastMouse.y = mouse.y;
};

// Lifecycle :
onMounted(() => {
	if (isTouchDevice()) return;

	window.addEventListener('mousemove', handleMouseMove);

	// Ticker :
	gsap.ticker.add(tick);
});

onUnmounted(() => {
	window.removeEventListener('mousemove', handleMouseMove);

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
