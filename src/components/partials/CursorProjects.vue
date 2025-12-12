<script setup lang="ts">
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { nextTick, onMounted, onUnmounted, ref, shallowRef } from 'vue';

import { isTouchDevice } from '#utils/device.ts';

import CursorProjectsItem from '#components/partials/CursorProjectsItem.vue';

// Types :
type ProjectItem = {
	id: number;
	x: number;
	y: number;
	rotation: number;
	component?: InstanceType<typeof CursorProjectsItem> | null;
};

// Props :
defineProps<{
	isAtBottom?: boolean;
}>();

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
const clientMouse = { x: 0, y: 0 };
const relativeMouse = { x: 0, y: 0 };

const items = shallowRef<ProjectItem[]>([]);
const spawnerEl = ref<HTMLElement | null>(null);

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
let hasMouseMoved = false;
let rect: DOMRect | null = null;

// Methods :
const updateMousePosition = () => {
	if (!rect || !hasMouseMoved) {
		isHovering = false;
		return;
	}

	relativeMouse.x = clientMouse.x - rect.left;
	relativeMouse.y = clientMouse.y - rect.top;

	isHovering =
		relativeMouse.x >= 0 && relativeMouse.x <= rect.width && relativeMouse.y >= 0 && relativeMouse.y <= rect.height;

	if (isHovering) {
		mouse.x = relativeMouse.x;
		mouse.y = relativeMouse.y;
	}
};

const updateRect = () => {
	if (spawnerEl.value) rect = spawnerEl.value.getBoundingClientRect();
	updateMousePosition();
};

const handleMouseMove = (e: MouseEvent) => {
	hasMouseMoved = true;
	clientMouse.x = e.clientX;
	clientMouse.y = e.clientY;
	updateMousePosition();
};

const handleMouseLeave = () => {
	isHovering = false;
};

const spawnItem = () => {
	const id = idCounter++;
	const rotation = Math.random() * config.maxRotation * 2 - config.maxRotation;

	items.value = [
		...items.value,
		{
			id,
			x: mouse.x,
			y: mouse.y,
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
	if (!isHovering || !rect) return;

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

	updateRect();

	window.addEventListener('resize', updateRect);
	window.addEventListener('scroll', updateRect, true);
	window.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('mouseleave', handleMouseLeave);

	// Ticker :
	ScrollTrigger.create({
		trigger: spawnerEl.value,
		start: 'top bottom',
		end: 'bottom top',
		onEnter: () => {
			gsap.ticker.add(tick);
		},
		onEnterBack: () => {
			gsap.ticker.add(tick);
		},
		onLeave: () => {
			gsap.ticker.remove(tick);
		},
		onLeaveBack: () => {
			gsap.ticker.remove(tick);
		}
	});
});

onUnmounted(() => {
	window.removeEventListener('resize', updateRect);
	window.removeEventListener('scroll', updateRect, true);
	window.removeEventListener('mousemove', handleMouseMove);
	document.removeEventListener('mouseleave', handleMouseLeave);

	// Ticker :
	gsap.ticker.remove(tick);
});
</script>

<template>
	<div class="cursor-projects-container">
		<div ref="spawnerEl" class="cursor-projects-items-wrapper" :class="{ 'is-at-bottom': isAtBottom }">
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
	position: absolute;
	z-index: 1;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
}

.cursor-projects-items-wrapper {
	$verticalOffset: fluidSize(160px, 120px);

	position: absolute;
	top: $verticalOffset;
	left: 0;
	width: 100%;
	height: calc(100% - ($verticalOffset * 2));

	&.is-at-bottom {
		height: calc(100% - $verticalOffset);
	}
}
</style>
