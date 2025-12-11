<script setup lang="ts">
import gsap from 'gsap';
import { onMounted, onUnmounted, ref } from 'vue';

// Refs :
const cursorEl = ref<HTMLDivElement | null>(null);

// State :
const mouse = { x: 0, y: 0 };
const state = { x: 0, y: 0, rotation: 0 };
const target = { x: 0, y: 0, rotation: 0 };

let firstMove = true;

// Variables :
const config = {
	DRAG_RADIUS: 60, // Cursor only moves if mouse is further than this
	LERP_POSITION: 0.06, // Slower, smoother follow
	LERP_ROTATION: 0.08,
	ROTATION_MULTIPLIER: 2.5, // Stronger rotation for velocity
	MAX_ROTATION: 60
};

const pos = {
	finalX: 0,
	finalY: 0,
	dx: 0,
	dy: 0,
	dist: 0,
	angle: 0,
	velocityX: 0,
	previousX: 0
};

// Methods :
const tick = () => {
	// 1. Calculate distance from current TARGET to MOUSE :
	pos.dx = mouse.x - target.x;
	pos.dy = mouse.y - target.y;
	pos.dist = Math.sqrt(pos.dx * pos.dx + pos.dy * pos.dy);

	// 2. Drag / Tether Logic :
	//// Only update target if mouse is outside the drag radius :
	if (pos.dist > config.DRAG_RADIUS) {
		pos.angle = Math.atan2(pos.dy, pos.dx);
		//// Target becomes the point on the radius circle closest to the mouse, effectively "dragging" the cursor :
		target.x = mouse.x - Math.cos(pos.angle) * config.DRAG_RADIUS;
		target.y = mouse.y - Math.sin(pos.angle) * config.DRAG_RADIUS;
	}

	// 3. Lerp Position :
	pos.previousX = state.x;
	state.x += (target.x - state.x) * config.LERP_POSITION;
	state.y += (target.y - state.y) * config.LERP_POSITION;

	// 4. Rotation Logic (Velocity-based) :
	//// Calculate actual velocity of the cursor :
	pos.velocityX = state.x - pos.previousX;

	//// Map velocity to rotation :
	target.rotation = -pos.velocityX * config.ROTATION_MULTIPLIER;

	//// Clamp and Lerp Rotation :
	target.rotation = Math.max(-config.MAX_ROTATION, Math.min(config.MAX_ROTATION, target.rotation));
	state.rotation += (target.rotation - state.rotation) * config.LERP_ROTATION;

	// 5. Render :
	if (cursorEl.value) {
		pos.finalX = state.x;
		pos.finalY = state.y;

		cursorEl.value.style.transform = `translate3d(${pos.finalX}px, ${pos.finalY}px, 0) rotate(${state.rotation}deg)`;
	}
};

const handleMouseMove = (e: MouseEvent) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;

	if (firstMove) {
		state.x = e.clientX;
		state.y = e.clientY;
		target.x = e.clientX;
		target.y = e.clientY;
		firstMove = false;
	}
};

// Attach & Detach :
onMounted(() => {
	window.addEventListener('mousemove', handleMouseMove);
	gsap.ticker.add(tick);
});

onUnmounted(() => {
	window.removeEventListener('mousemove', handleMouseMove);
	gsap.ticker.remove(tick);
});
</script>

<template>
	<div class="cursor-container">
		<div ref="cursorEl" class="cursor-wrapper">
			<div class="cursor"></div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.cursor-container {
	position: fixed;
	z-index: 10;
	inset: 0;
	pointer-events: none;
}

.cursor-wrapper {
	position: fixed;
	left: 0;
	top: 0;
	width: 24px;
	height: 24px;
	will-change: transform;
}

.cursor {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: red;
	border-radius: 4px;
	top: 50%;
	left: 50%;
	transform: translate3d(-50%, -50%, 0);
}
</style>
