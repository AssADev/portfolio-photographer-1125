<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import gsap from 'gsap';
import { VueLenis } from 'lenis/vue';
import { onMounted, onUnmounted, useTemplateRef, watchEffect } from 'vue';

import { isTouchDevice } from '#utils/device.ts';
import { preventScrollMobileSafari } from '#utils/preventScrollSafari.ts';

import { $global } from '#stores/global.ts';

defineOptions({ inheritAttrs: false });
const { root, class: className } = defineProps<{ root?: boolean; class?: string }>();

// Pass class only if root is false :
const attrs = !root ? { class: className } : {};

const globalStore = useStore($global);
const lenisRef = useTemplateRef<typeof VueLenis>('lenis');

if (root) {
	// Only lock the root scroll :
	watchEffect((onCleanup) => {
		if (globalStore.value.lockScroll) {
			lenisRef.value?.lenis?.stop();
			// Makes sure we really can't scroll on mobile :
			if (isTouchDevice()) {
				const cleanup = preventScrollMobileSafari();
				onCleanup(cleanup);
			}
		} else {
			lenisRef.value?.lenis?.start();
		}
	});
}

// Methods :
const update = (time: number) => {
	lenisRef.value?.lenis?.raf(time * 1000);
};

// Attach & Detach :
onMounted(() => {
	gsap.ticker.add(update);
});

onUnmounted(() => {
	gsap.ticker.remove(update);
});
</script>

<template>
	<VueLenis ref="lenis" :auto-raf="false" :root v-bind="attrs">
		<slot />
	</VueLenis>
</template>
