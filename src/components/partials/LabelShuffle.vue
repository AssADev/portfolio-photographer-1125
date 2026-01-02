<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

// Props :
const props = defineProps<{
	label: string;
}>();

// Refs :
const originalLetters = computed(() => props.label.split(''));
const displayedLetters = ref<string[]>([]);
const letterWidths = ref<number[]>([]);
const letterRefs = ref<HTMLElement[]>([]);

// Variables :
const LETTERS_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}<>?/';
const SHUFFLE_MAX_ITERATIONS = 5;
const SHUFFLE_SPEED = 70;

let iterationCount = 0;
let activeIndices: number[] = [];
let intervalId: ReturnType<typeof setInterval> | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

displayedLetters.value = [...originalLetters.value];

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
	activeIndices = indices;

	// Init shuffle :
	indices.forEach((idx) => {
		if (idx >= 0 && idx < displayedLetters.value.length) {
			displayedLetters.value[idx] = getRandomChar();
		}
	});

	// If already shuffling, we just updated the indices for the next tick
	if (intervalId) return;

	iterationCount = 0;

	// Start loop :
	intervalId = setInterval(() => {
		iterationCount++;
		console.log(iterationCount);

		if (iterationCount >= SHUFFLE_MAX_ITERATIONS) {
			resetLetters();
			return;
		}

		// Use a temporary array to build next state
		const nextState = [...originalLetters.value];
		activeIndices.forEach((idx) => {
			if (idx >= 0 && idx < nextState.length) {
				nextState[idx] = getRandomChar();
			}
		});
		displayedLetters.value = nextState;
	}, SHUFFLE_SPEED);
};

const onLetterEnter = (index: number) => {
	const neighbors = [index - 1, index, index + 1].filter((i) => i >= 0 && i < originalLetters.value.length);
	startShuffle(neighbors);
};

const onWrapperLeave = () => {
	resetLetters();
};

// Attach :
onMounted(() => {
	document.fonts.ready.then(() => {
		measureWidths();
	});
});
</script>

<template>
	<div class="partials-label-shuffle" @mouseleave="onWrapperLeave">
		<span
			v-for="(letter, index) in displayedLetters"
			:key="index"
			ref="letterRefs"
			class="letter-wrapper"
			@mouseenter="onLetterEnter(index)"
			:style="{ width: letterWidths[index] ? `${letterWidths[index]}px` : 'auto' }"
		>
			<span class="letter">
				{{ letter }}
			</span>
		</span>
	</div>
</template>

<style lang="scss" scoped>
.partials-label-shuffle {
	position: relative;
	display: inline-flex;
	transition: color 0.3s $power2InOut;

	@include hover {
		color: $white;

		&::before {
			transform: scale3d(1, 1, 1);
			transform-origin: left center;
		}
	}

	&::before {
		content: '';
		position: absolute;
		inset: -2px -4px;
		background: $eerieBlack;
		border-radius: 3px;
		transform: scale3d(0, 1, 1);
		transform-origin: right center;
		transition: transform 0.3s $power2InOut;
	}
}

.letter-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: pre;
	text-align: center;
}

.letter {
	display: inline-block;
	will-change: contents;
}
</style>
