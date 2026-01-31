<script setup lang="ts">
import gsap from 'gsap';
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

import { isTouchDevice } from '#utils/device.ts';

// Refs :
const elRef = useTemplateRef('elRef');
const cursorEl = useTemplateRef('cursorRef');
const cursorLabelRef = useTemplateRef('cursorLabelRef');

// State :
const mouse = { x: 0, y: 0 };
const state = { x: 0, y: 0, rotation: 0, maxRotation: 60 };
const target = { x: 0, y: 0, rotation: 0, maxRotation: 60 };

let firstMove = true;
let hoverTween: gsap.core.Tween | null = null;
let activeTarget: HTMLElement | null = null;
let currentText = '';
let activeSnapTarget: HTMLElement | null = null;
const charsRefs = ref<HTMLSpanElement[]>([]);

let hasPending = false;
let isTransitioning = false;
let pendingText: string | null = null;
let outTimeout: ReturnType<typeof setTimeout> | null = null;

const snapState = {
	w: 9,
	h: 9,
	radius: 2
};

// Variables :
const config = {
	DRAG_RADIUS: 60,
	LERP_POSITION: 0.06,
	LERP_ROTATION: 0.08,
	ROTATION_MULTIPLIER: 2.5,
	DEFAULT_MAX_ROTATION: 60,
	HOVER_MAX_ROTATION: 20,
	DEFAULT_SIZE: 9,
	DEFAULT_RADIUS: 2,
	SNAP_RADIUS: 3,
	LERP_SNAP: 0.1
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
const handleMouseMove = (e: MouseEvent) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;

	if (firstMove) {
		state.x = e.clientX;
		state.y = e.clientY;
		target.x = e.clientX;
		target.y = e.clientY;
		firstMove = false;

		gsap.to(elRef.value, {
			opacity: 1,
			display: 'block',
			duration: 0.4,
			ease: 'power2.out'
		});
	}
};

const tick = () => {
	// 1. Snapping Logic (Pre-calc) :
	if (activeSnapTarget) {
		const rect = activeSnapTarget.getBoundingClientRect();
		const padX = 8;
		const padY = 4;

		target.x = rect.left + rect.width / 2;
		target.y = rect.top + rect.height / 2;
		target.maxRotation = 0;

		snapState.w += (rect.width + padX - snapState.w) * config.LERP_SNAP;
		snapState.h += (rect.height + padY - snapState.h) * config.LERP_SNAP;
		snapState.radius += (config.SNAP_RADIUS - snapState.radius) * config.LERP_SNAP;
	} else {
		snapState.w += (config.DEFAULT_SIZE - snapState.w) * config.LERP_SNAP;
		snapState.h += (config.DEFAULT_SIZE - snapState.h) * config.LERP_SNAP;
		snapState.radius += (config.DEFAULT_RADIUS - snapState.radius) * config.LERP_SNAP;
	}

	// 2. Calculate distance from current TARGET to MOUSE :
	pos.dx = mouse.x - target.x;
	pos.dy = mouse.y - target.y;
	pos.dist = Math.sqrt(pos.dx * pos.dx + pos.dy * pos.dy);

	// 3. Drag / Tether Logic :
	//// Only update target if mouse is outside the drag radius :
	if (!activeSnapTarget && pos.dist > config.DRAG_RADIUS) {
		pos.angle = Math.atan2(pos.dy, pos.dx);

		//// Target becomes the point on the radius circle closest to the mouse, effectively "dragging" the cursor :
		target.x = mouse.x - Math.cos(pos.angle) * config.DRAG_RADIUS;
		target.y = mouse.y - Math.sin(pos.angle) * config.DRAG_RADIUS;
	}

	// 4. Lerp Position :
	pos.previousX = state.x;
	state.x += (target.x - state.x) * config.LERP_POSITION;
	state.y += (target.y - state.y) * config.LERP_POSITION;

	//// Lerp Max Rotation :
	state.maxRotation += (target.maxRotation - state.maxRotation) * config.LERP_ROTATION;

	// 5. Rotation Logic (Velocity-based) :
	//// Calculate actual velocity of the cursor :
	pos.velocityX = state.x - pos.previousX;

	//// Map velocity to rotation :
	target.rotation = -pos.velocityX * config.ROTATION_MULTIPLIER;

	//// Clamp and Lerp Rotation :
	target.rotation = Math.max(-state.maxRotation, Math.min(state.maxRotation, target.rotation));
	state.rotation += (target.rotation - state.rotation) * config.LERP_ROTATION;

	// 6. Render :
	if (cursorEl.value) {
		const square = cursorEl.value.querySelector('.cursor-square') as HTMLElement;
		if (square) {
			square.style.setProperty('--cursor-w', `${snapState.w}px`);
			square.style.setProperty('--cursor-h', `${snapState.h}px`);
			square.style.borderRadius = `${snapState.radius}px`;
		}

		pos.finalX = state.x;
		pos.finalY = state.y;

		cursorEl.value.style.transform = `translate3d(${pos.finalX}px, ${pos.finalY}px, 0) rotate(${state.rotation}deg)`;
	}
};

// Utils :
const findCommonPrefix = (a: string, b: string) => {
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) {
		i++;
	}
	return i;
};

const updateLabel = (newText: string | null) => {
	const targetText = newText || '';

	if (isTransitioning) {
		pendingText = targetText;
		hasPending = true;
		return;
	}

	if (targetText === currentText && charsRefs.value.length > 0) return;

	isTransitioning = true;
	performTransition(targetText);
};

const performTransition = (targetText: string) => {
	const commonPrefixLen = findCommonPrefix(currentText, targetText);

	// Characters that need to leave :
	const charsToExit = charsRefs.value.slice(commonPrefixLen);

	if (charsToExit.length > 0) {
		hoverTween?.kill();
		hoverTween = gsap.to(charsToExit, {
			x: '120%',
			duration: 0.25,
			stagger: -0.02,
			ease: 'power2.in',
			onComplete: () => {
				charsToExit.forEach((el) => el.parentElement?.remove());
				charsRefs.value = charsRefs.value.slice(0, commonPrefixLen);
				addNewChars(targetText, commonPrefixLen);
			}
		});
	} else {
		addNewChars(targetText, commonPrefixLen);
	}
};

const addNewChars = (targetText: string, commonPrefixLen: number) => {
	if (!cursorLabelRef.value) {
		isTransitioning = false;
		return;
	}

	const suffix = targetText.slice(commonPrefixLen);
	if (suffix.length > 0) {
		suffix.split('').forEach((char) => {
			const charWrapper = document.createElement('span');
			charWrapper.className = 'char-wrapper';

			const charInner = document.createElement('span');
			charInner.className = 'char';
			charInner.textContent = char === ' ' ? '\u00A0' : char;
			charInner.style.transform = 'translate3d(120%, 0, 0)';

			charWrapper.appendChild(charInner);
			cursorLabelRef.value?.appendChild(charWrapper);
			charsRefs.value.push(charInner);
		});

		const newChars = charsRefs.value.slice(commonPrefixLen);
		hoverTween?.kill();
		hoverTween = gsap.to(newChars, {
			x: '0%',
			duration: 0.3,
			stagger: 0.02,
			ease: 'power2.out',
			onComplete: () => {
				finishStep(targetText);
			}
		});
	} else {
		finishStep(targetText);
	}
};

const finishStep = (targetText: string) => {
	isTransitioning = false;
	currentText = targetText;

	if (!activeTarget && targetText === '') {
		target.maxRotation = config.DEFAULT_MAX_ROTATION;
	}

	if (hasPending) {
		const next = pendingText;
		hasPending = false;
		updateLabel(next);
	}
};

// Events :
const handleMouseOver = (e: MouseEvent) => {
	const eventTarget = e.target as HTMLElement;
	const targetEl = eventTarget.closest('[data-cursor-label]') as HTMLElement;
	const snapEl = eventTarget.closest('[data-cursor-snap]') as HTMLElement;

	// 1. Update snap target first :
	if (snapEl && snapEl !== activeSnapTarget) {
		activeSnapTarget = snapEl;
		if (activeTarget) triggerOut();
	} else if (!snapEl && activeSnapTarget) {
		activeSnapTarget = null;
		target.maxRotation = config.DEFAULT_MAX_ROTATION;

		// When leaving, position the target at the bottom-right of the mouse :
		const releaseAngle = Math.PI / 4; // 45 degrees
		target.x = mouse.x + Math.cos(releaseAngle) * (config.DRAG_RADIUS / 2);
		target.y = mouse.y + Math.sin(releaseAngle) * config.DRAG_RADIUS;
	}

	// 2. Only process label logic if we are NOT snapping :
	if (!activeSnapTarget) {
		if (targetEl && targetEl !== activeTarget) {
			triggerHover(targetEl);
		} else if (!targetEl && activeTarget) {
			triggerOut();
		}
	} else if (activeTarget) {
		triggerOut();
	}
};

const triggerHover = (targetEl: HTMLElement) => {
	if (outTimeout) {
		clearTimeout(outTimeout);
		outTimeout = null;
	}

	activeTarget = targetEl;
	target.maxRotation = config.HOVER_MAX_ROTATION;

	const label = targetEl.getAttribute('data-cursor-label');
	updateLabel(label);
};

const triggerOut = () => {
	if (outTimeout) clearTimeout(outTimeout);

	outTimeout = setTimeout(() => {
		activeTarget = null;
		updateLabel(null);
		outTimeout = null;
	}, 50);
};

// Attach & Detach :
onMounted(() => {
	if (isTouchDevice()) return;

	window.addEventListener('mousemove', handleMouseMove);
	window.addEventListener('mouseover', handleMouseOver);

	// Ticker :
	gsap.ticker.add(tick);
});

onUnmounted(() => {
	window.removeEventListener('mousemove', handleMouseMove);
	window.removeEventListener('mouseover', handleMouseOver);

	// Ticker :
	gsap.ticker.remove(tick);
});
</script>

<template>
	<div ref="elRef" class="cursor-container">
		<div ref="cursorRef" class="cursor-wrapper">
			<div class="cursor-square"></div>
			<div ref="cursorLabelRef" class="cursor-label"></div>
		</div>
	</div>
</template>

<style lang="scss">
.cursor-label {
	@include roobert-12-uppercase;

	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate3d(0, -50%, 0);
	display: flex;
	white-space: nowrap;
	pointer-events: none;
	margin-inline-start: calc((var(--cursor-square-size) / 2) + 6px);

	.char-wrapper {
		overflow: hidden;
	}

	.char {
		display: inline-block;
	}
}
</style>

<style lang="scss" scoped>
.cursor-container {
	--cursor-square-size: 9px;

	position: fixed;
	z-index: 15;
	inset: 0;
	color: $white;
	opacity: 0;
	display: none;
	pointer-events: none;
	mix-blend-mode: difference;
}

.cursor-wrapper {
	position: fixed;
	left: 0;
	top: 0;
	will-change: transform;
}

.cursor-square {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate3d(-50%, -50%, 0);
	width: var(--cursor-w, var(--cursor-square-size));
	height: var(--cursor-h, var(--cursor-square-size));
	background: $white;
	border-radius: 2px;
}
</style>
