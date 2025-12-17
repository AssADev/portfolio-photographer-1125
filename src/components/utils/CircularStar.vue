<script setup lang="ts">
import { useIntersectionObserver, useResizeObserver, useTemplateRefsList } from '@vueuse/core';
import type Lenis from 'lenis';
import { useLenis } from 'lenis/vue';
import { onUnmounted, ref, useTemplateRef, watchEffect } from 'vue';

import { Motion } from '#utils/Motion.ts';

import Icon from '#components/utils/Icon.vue';

// Props :
const { scrollSpeed } = defineProps<{ scrollSpeed?: number }>();

// Refs
let inView = false;
let animation: Animation | undefined;

const containerRef = useTemplateRef('containerRef');
const innerRef = useTemplateRef('innerRef');

const lenis = scrollSpeed ? useLenis() : ref();

const rate = new Motion(1);
rate.on('change', (r: any) => animation?.updatePlaybackRate(r));

// Methods :
const onScroll = (instance: Lenis) => {
	rate.set(instance.velocity * (scrollSpeed || 1) + instance.direction);
};

// Watchers :
watchEffect(() => {
	animation?.cancel();

	animation = innerRef.value?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
		duration: 120000,
		fill: 'both',
		iterations: Infinity
	});

	if (!inView) animation?.pause();
});

useIntersectionObserver(containerRef, ([entry]) => {
	if (entry.isIntersecting) {
		inView = true;
		animation?.play();
		scrollSpeed && lenis.value?.on('scroll', onScroll);
	} else {
		inView = false;
		animation?.pause();
		scrollSpeed && lenis.value?.off('scroll', onScroll);
	}
});

// Detach :
onUnmounted(() => {
	rate.clean();
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
	pointer-events: none;

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
