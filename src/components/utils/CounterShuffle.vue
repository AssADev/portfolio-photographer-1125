<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { formatIndex } from '#utils/formatIndex.ts';

// Props :
const props = defineProps<{
	value: string | number;
}>();

// Computed :
const formattedValue = computed(() => {
	return formatIndex(props.value);
});

// Refs :
const direction = ref<'next' | 'prev'>('next');
const letters = ref(formattedValue.value.split(''));
const charWidth = ref<number | null>(null);
const measureRef = ref<HTMLElement | null>(null);

// Methods :
const measure = () => {
	if (measureRef.value) charWidth.value = measureRef.value.offsetWidth;
};

// Watchers :
watch(
	() => props.value,
	(newVal, oldVal) => {
		if (oldVal !== undefined && newVal !== oldVal) {
			direction.value = newVal > oldVal ? 'next' : 'prev';
		}
		letters.value = formattedValue.value.split('');
	},
	{ immediate: true }
);

// Attach & Detach :
onMounted(() => {
	document.fonts.ready.then(measure);
	window.addEventListener('resize', measure);
});

onUnmounted(() => {
	window.removeEventListener('resize', measure);
});
</script>

<template>
	<div class="counter-shuffle">
		<span ref="measureRef" class="char measure-char" aria-hidden="true">0</span>

		<div
			v-for="(char, index) in letters"
			:key="index"
			class="char-wrapper"
			:style="{ width: charWidth ? `${charWidth}px` : 'auto' }"
		>
			<Transition :name="`slide-${direction}`">
				<span :key="char" class="char">
					{{ char }}
				</span>
			</Transition>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.counter-shuffle {
	display: inline-flex;
	align-items: center;
}

.char-wrapper {
	position: relative;
	display: inline-flex;
	overflow: hidden;
	vertical-align: bottom;

	&:first-of-type {
		justify-content: flex-end;

		.slide-next-leave-active,
		.slide-prev-leave-active {
			right: 0;
			left: auto;
		}
	}
}

.char {
	display: inline-block;
	will-change: transform;

	&.measure-char {
		position: absolute;
		visibility: hidden;
		pointer-events: none;
		white-space: pre;
	}
}

// Transitions :
//// Next : Old goes Left (-175%), New from Right (+175%)
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
	transition: transform 0.6s $power2InOut;
}

.slide-next-enter-from {
	transform: translate3d(175%, 0, 0);
}

.slide-next-leave-to {
	transform: translate3d(-175%, 0, 0);
}

//// Previous : Old goes Right (+175%), New from Left (-175%)
.slide-prev-enter-from {
	transform: translate3d(-175%, 0, 0);
}

.slide-prev-leave-to {
	transform: translate3d(175%, 0, 0);
}

.slide-next-leave-active,
.slide-prev-leave-active {
	position: absolute;
	top: 0;
	left: 0;
}
</style>
