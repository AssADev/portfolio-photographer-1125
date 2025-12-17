<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { isIOS } from '@vueuse/core';
import gsap from 'gsap';
import { VueLenis } from 'lenis/vue';
import { onMounted, onUnmounted, useTemplateRef, watchEffect } from 'vue';

import { preventScrollMobileSafari } from '#utils/preventScrollSafari.ts';

import { $global } from '#stores/global.ts';

defineOptions({ inheritAttrs: false });
const { root, class: className } = defineProps<{ root?: boolean; class?: string }>();

// Pass class only if root is false :
const attrs = !root ? { class: className } : {};

const globalStore = useStore($global);
const lenisRef = useTemplateRef<typeof VueLenis>('lenis');

let restoreScroll: () => void;

if (root) {
	// Only lock the root scroll :
	watchEffect(() => {
		if (globalStore.value.lockScroll) {
			lenisRef.value?.lenis?.stop();
			// Makes sure we really can't scroll on iOS :
			if (isIOS) restoreScroll = preventScrollMobileSafari();
		} else {
			lenisRef.value?.lenis?.start();
			restoreScroll?.();
		}
	});
}

// Methods :
const update = (time: number) => {
	lenisRef.value?.lenis?.raf(time * 1000);

	// Update global scroll offset and velocity :
	if (lenisRef.value?.lenis) {
		const velocity = lenisRef.value.lenis.velocity;

		// Update direction only if moving :
		if (Math.abs(velocity) > 0.1) {
			document.documentElement.style.setProperty('--scroll-direction', velocity > 0 ? 'normal' : 'reverse');
		}
	}
};

// Attach & Detach :
onMounted(() => {
	gsap.ticker.add(update);
});

onUnmounted(() => gsap.ticker.remove(update));
</script>

<template>
	<VueLenis ref="lenis" :auto-raf="false" :root v-bind="attrs">
		<slot />
	</VueLenis>
</template>
