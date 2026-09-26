<script setup lang="ts">
import { Image as UnpicImage } from '@unpic/vue/base';
import { computed } from 'vue';

import { type ImageBaseProps } from '#utils/image.ts';

// Props :
const { source, ...props } = defineProps<ImageBaseProps>();

// The options of our Image component must not end up as attributes of the <img> tag :
const OWN_OPTIONS = ['maskSrc', 'blur'];
const unpicProps = computed(() =>
	Object.fromEntries(Object.entries(props).filter(([key]) => !OWN_OPTIONS.includes(key)))
);
</script>

<template>
	<UnpicImage
		ref="img"
		v-bind="unpicProps as typeof props"
		draggable="false"
		data-allow-mismatch="style"
		nopin="nopin"
	/>
</template>
