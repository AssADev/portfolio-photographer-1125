<script setup lang="ts">
import gsap from 'gsap';
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

// Props :
const props = withDefaults(
	defineProps<{
		label: string;
		isActive?: boolean;
		noSnap?: boolean;
		reveal?: boolean;
		speed?: 'normal' | 'fast';
	}>(),
	{
		isActive: true,
		noSnap: false,
		reveal: false,
		speed: 'fast'
	}
);

// Refs :
const rootEl = useTemplateRef('rootEl');

const originalLetters = computed(() => props.label.split(''));
const displayedLetters = ref<string[]>([]);
const letterWidths = ref<number[]>([]);
const letterRefs = ref<HTMLElement[]>([]);
const innerRefs = ref<HTMLElement[]>([]);

// Variables :
const LETTERS_POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}<>?/';
const SHUFFLE_MAX_ITERATIONS = 5;
const SHUFFLE_SPEED = 70;

let iterationCount = 0;
let activeIndices: number[] = [];
let intervalId: ReturnType<typeof setInterval> | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

displayedLetters.value = [...originalLetters.value];

// Computed :
const animationSettings = computed(() => {
	return props.speed === 'normal'
		? { duration: 1.1, stagger: 0.075, ease: 'power4.out' }
		: { duration: 0.4, stagger: 0.03, ease: 'power2.out' };
});

// Methods :
const measureWidths = () => {
	if (letterRefs.value.length) {
		letterWidths.value = letterRefs.value.map((el) => el.offsetWidth);
	}
};

const getRandomChar = () => LETTERS_POOL[Math.floor(Math.random() * LETTERS_POOL.length)];

const resetLetters = () => {
	displayedLetters.value = [...originalLetters.value];
	activeIndices = [];
	if (intervalId) clearInterval(intervalId);
	if (timeoutId) clearTimeout(timeoutId);
	intervalId = null;
	timeoutId = null;
};

const startShuffle = (indices: number[]) => {
	if (!props.isActive) return;
	activeIndices = indices;

	// Init shuffle :
	indices.forEach((idx) => {
		if (idx >= 0 && idx < displayedLetters.value.length) {
			displayedLetters.value[idx] = getRandomChar();
		}
	});

	if (intervalId) return;

	iterationCount = 0;

	intervalId = setInterval(() => {
		iterationCount++;

		if (iterationCount >= SHUFFLE_MAX_ITERATIONS) {
			resetLetters();
			return;
		}

		const nextState = [...originalLetters.value];
		activeIndices.forEach((idx) => {
			if (idx >= 0 && idx < nextState.length) nextState[idx] = getRandomChar();
		});

		displayedLetters.value = nextState;
	}, SHUFFLE_SPEED);
};

const onLetterEnter = (index: number) => {
	if (!props.isActive) return;
	const neighbors = [index - 1, index, index + 1].filter((i) => i >= 0 && i < originalLetters.value.length);
	startShuffle(neighbors);
};

// Animations :
const animateIn = () => {
	gsap.killTweensOf(innerRefs.value);
	gsap.to(innerRefs.value, {
		x: '0%',
		...animationSettings.value,
		overwrite: true
	});
};

const animateOut = () => {
	const { duration, stagger, ease } = animationSettings.value;

	gsap.killTweensOf(innerRefs.value);
	gsap.to(innerRefs.value, {
		x: '120%',
		duration,
		stagger: -stagger,
		ease: ease.replace('out', 'in'),
		overwrite: true
	});
};

const handleAnimateIn = () => {
	gsap.killTweensOf(innerRefs.value);
	gsap.to(innerRefs.value, {
		x: '0%',
		...animationSettings.value
	});
};

// Watchers :
watch(
	() => props.isActive,
	(val) => {
		if (val) animateIn();
		else animateOut();
	}
);

watch(
	() => props.label,
	() => {
		displayedLetters.value = [...originalLetters.value];
		nextTick(() => {
			measureWidths();
		});
	}
);

// Attach & Detach :
onMounted(() => {
	if (!props.isActive || props.reveal) {
		gsap.set(innerRefs.value, { x: '120%' });
	}

	document.fonts.ready.then(() => {
		measureWidths();
	});

	window.addEventListener('resize', measureWidths);
	rootEl.value?.addEventListener('label-shuffle-reveal', handleAnimateIn);
});

onUnmounted(() => {
	window.removeEventListener('resize', measureWidths);
	rootEl.value?.removeEventListener('label-shuffle-reveal', handleAnimateIn);
});
</script>

<template>
	<div
		ref="rootEl"
		class="partials-label-shuffle"
		@mouseleave="resetLetters"
		:data-cursor-snap="!noSnap ? true : null"
	>
		<span
			v-for="(letter, index) in originalLetters"
			:key="index"
			ref="letterRefs"
			class="letter-wrapper"
			:style="{ width: letterWidths[index] ? `${letterWidths[index]}px` : 'auto' }"
		>
			<span ref="innerRefs" class="letter" @mouseenter="onLetterEnter(index)">
				{{ displayedLetters[index] === ' ' ? '\u00A0' : displayedLetters[index] }}
			</span>
		</span>
	</div>
</template>

<style lang="scss" scoped>
.partials-label-shuffle {
	@include a11y-focus;

	position: relative;
	display: inline-flex;
	transition: color 0.3s $power2InOut;
}

.letter-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: pre;
	text-align: center;
	overflow: hidden;
}

.letter {
	display: inline-block;
	will-change: transform;
}
</style>
