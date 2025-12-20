<script setup lang="ts">
import { type SVGAttributes, computed, defineAsyncComponent, h } from 'vue';

import { ICONS } from '#utils/icon.ts';

// Props :
const { name, mirrorX, mirrorY } = defineProps<
	{
		/** Name of the file in `src/assets/svg/` */
		name: string | number;
		mirrorX?: boolean;
		mirrorY?: boolean;
		noFill?: boolean;
	} & /* @vue-ignore */ Omit<SVGAttributes, 'name'>
>();

const AsyncIcon = computed(
	() =>
		ICONS[name] &&
		defineAsyncComponent({
			loader: ICONS[name].svg,
			loadingComponent: {
				render() {
					return h('svg');
				}
			},
			delay: 0
		})
);

if (!AsyncIcon.value) {
	// retrieve server logs
	// eslint-disable-next-line no-console
	console.log(`[icon] "${name}" not found in ICONS.`);
}

// Computed :
const style = computed(() => {
	if (!mirrorX && !mirrorY) return undefined;
	const transform = [];
	if (mirrorX) transform.push('scaleX(-1)');
	if (mirrorY) transform.push('scaleY(-1)');
	return { transform: transform.join(' ') };
});
</script>

<template>
	<template v-if="ICONS[name]">
		<AsyncIcon :class="{ 'no-fill': noFill }" :style="style" />
	</template>
	<svg v-else width="30" height="30" viewBox="0 0 30 30" fill="none" :title="name">
		<rect x="0" y="0" width="30" height="30" fill="red" />
	</svg>
</template>

<style scoped lang="scss">
.no-fill {
	:deep(*[fill]) {
		fill: none;
	}
}
</style>
