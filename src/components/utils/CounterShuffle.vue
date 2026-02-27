<script setup lang="ts">
import gsap from 'gsap';
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

import { formatIndex } from '#utils/formatIndex.ts';

// Props :
const props = withDefaults(
	defineProps<{
		value: string | number;
		reveal?: boolean;
	}>(),
	{
		reveal: false
	}
);

// Computed :
const formattedValue = computed(() => {
	return formatIndex(props.value);
});

// Refs :
const direction = ref<'next' | 'prev'>('next');
const letters = ref(formattedValue.value.split(''));
const charWidth = ref<number | null>(null);

const rootEl = useTemplateRef('rootEl');
const measureRef = useTemplateRef('measureRef');
const charRefs = ref<HTMLElement[]>([]);

// Methods :
const measure = () => {
	if (measureRef.value) charWidth.value = measureRef.value.offsetWidth;
};

// Animations :
const handleAnimateIn = () => {
	gsap.killTweensOf(charRefs.value);
	gsap.to(charRefs.value, {
		x: '0%',
		duration: 1.1,
		stagger: 0.075,
		ease: 'power4.out',
		onComplete: () => {
			gsap.set(charRefs.value, { clearProps: 'transform' });
		}
	});
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
	if (props.reveal) {
		gsap.set(charRefs.value, { x: '160%' });
	}

	document.fonts.ready.then(measure);
	window.addEventListener('resize', measure);
	rootEl.value?.addEventListener('label-shuffle-reveal', handleAnimateIn);
});

onUnmounted(() => {
	window.removeEventListener('resize', measure);
	rootEl.value?.removeEventListener('label-shuffle-reveal', handleAnimateIn);
});
</script>

<template>
	<div ref="rootEl" class="counter-shuffle">
		<span ref="measureRef" class="char measure-char" aria-hidden="true">0</span>

		<div
			v-for="(char, index) in letters"
			:key="index"
			class="char-wrapper"
			:style="{ width: charWidth ? `${charWidth}px` : 'auto' }"
		>
			<Transition :name="`slide-${direction}`">
				<span :key="char" ref="charRefs" class="char">
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
