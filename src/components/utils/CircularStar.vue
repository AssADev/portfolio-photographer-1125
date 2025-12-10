<script setup lang="ts">
import { useIntersectionObserver, useResizeObserver, useTemplateRefsList } from '@vueuse/core';
import type Lenis from 'lenis';
import { useLenis } from 'lenis/vue';
import { onUnmounted, reactive, ref, useTemplateRef, watch, watchEffect } from 'vue';

import Icon from '#components/utils/Icon.vue';

// Refs
let inView = false;
let animation: Animation | undefined;

const scrolling = ref(false);

const containerRef = useTemplateRef('containerRef');
const innerRef = useTemplateRef('innerRef');

const lenis = useLenis();

// Methods :
const onScroll = (instance: Lenis) => {
	scrolling.value = !!instance.isScrolling && Math.abs(instance.velocity) > 10;
};

// Watchers :
watchEffect(() => {
	animation?.cancel();

	animation = innerRef.value?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
		duration: 120000,
		direction: lenis.value?.velocity! > 0 ? 'reverse' : 'normal',
		fill: 'both',
		iterations: Infinity
	});

	if (!inView) animation?.pause();
});

useIntersectionObserver(containerRef, ([entry]) => {
	if (entry.isIntersecting) {
		inView = true;
		animation?.play();
		lenis.value?.on('scroll', onScroll);
	} else {
		inView = false;
		animation?.pause();
		lenis.value?.off('scroll', onScroll);
	}
});

// Detach :
onUnmounted(() => {
	lenis.value?.off('scroll', onScroll);
});
</script>

<template>
	<div ref="containerRef" class="partials-circular-star">
		<div ref="innerRef" class="circular-star-scroll-wrapper">
			<Icon name="circular-star" />
		</div>
	</div>
</template>

<style scoped lang="scss">
.partials-circular-star {
	aspect-ratio: 1 / 1;

	.circular-star-scroll-wrapper {
		width: 100%;
		height: 100%;
	}

	svg {
		width: 100%;
		height: 100%;
		aspect-ratio: inherit;
	}
}
</style>
