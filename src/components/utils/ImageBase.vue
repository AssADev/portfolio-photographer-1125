<script setup lang="ts">
import { Image as UnpicImage } from '@unpic/vue/base';

import { type ImageBaseProps } from '#utils/image.ts';

const { source, ...props } = defineProps<ImageBaseProps>();
</script>

<template>
	<UnpicImage ref="img" v-bind="props" draggable="false" data-allow-mismatch="style" nopin="nopin" />
</template>
