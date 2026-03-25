<script setup lang="ts">
import { useIntersectionObserver, useResizeObserver, useTemplateRefsList } from '@vueuse/core';
import type Lenis from 'lenis';
import { useLenis } from 'lenis/vue';
import { onUnmounted, ref, useTemplateRef, watch, watchEffect } from 'vue';

import { Motion } from '#utils/Motion.ts';

import Icon from '#components/utils/Icon.vue';

// Props :
const { scrollSpeed } = defineProps<{ scrollSpeed?: number }>();

// Refs :
const inView = ref(false);
let animation: Animation | undefined;

const containerRef = useTemplateRef('containerRef');
const innerRef = useTemplateRef('innerRef');

const numberOfRotations = 1000;
const lenis = scrollSpeed ? useLenis() : ref();

const rate = new Motion(1);
rate.on('change', (r: any) => animation?.updatePlaybackRate(r));

// Methods :
const onScroll = (instance: Lenis) => {
	// Ensure we have a direction (default to 1) to avoid stopping the animation when scroll is idle or reset :
	const direction = instance.direction || 1;

	// Clamp velocity to prevent insane rotation speeds during a programmatic scrollTo :
	const clampedVelocity = Math.max(-10, Math.min(10, instance.velocity));

	rate.set(clampedVelocity * (scrollSpeed || 1) + direction * Math.sign(scrollSpeed || 1));
};

// Watchers :
watchEffect(() => {
	if (!innerRef.value) return;

	animation?.cancel();

	animation = innerRef.value.animate(
		[
			{ transform: `rotate(-${360 * numberOfRotations}deg)` },
			{ transform: `rotate(${360 * numberOfRotations}deg)` }
		],
		{
			duration: 120000 * numberOfRotations,
			fill: 'both',
			iterations: Infinity
		}
	);

	// Sync current rate immediately :
	animation.updatePlaybackRate(rate.value);

	// Commence au milieu de l'animation (position 0deg)
	animation.currentTime = (animation.effect?.getTiming().duration as number) / 2;

	if (!inView.value) animation.pause();
});

// Play/Pause animation based on visibility
watch(inView, (val: boolean) => {
	if (val) animation?.play();
	else animation?.pause();
});

// Manage scroll listener with automatic cleanup
watchEffect(() => {
	if (scrollSpeed && lenis.value && inView.value) {
		lenis.value.on('scroll', onScroll);
		return () => lenis.value.off('scroll', onScroll);
	}
});

useIntersectionObserver(containerRef, ([entry]) => {
	inView.value = entry.isIntersecting;
});

// Detach :
onUnmounted(() => {
	rate.clean();
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
