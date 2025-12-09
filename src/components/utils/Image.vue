<script setup lang="ts">
import { computed, useAttrs } from 'vue';

import { type ImageProps, parseDimensionsFromUrl, parseImageData, transform } from '#utils/image.ts';

import ImageBase from './ImageBase.vue';
import SourceBase from './SourceBase.vue';

defineOptions({ inheritAttrs: false });
const { source, alt, ...props } = defineProps<ImageProps>();

const attrs = useAttrs();
const imageData = computed(() => {
	const data = parseImageData({ ...attrs, ...props });

	// Adding height if width is given and no aspect ratio is defined :
	if (!props.aspectRatio && (!props.height || !props.width)) {
		const { width, height } = parseDimensionsFromUrl(data.bind.src);
		if (width && height) data.bind.aspectRatio = width / height;
	}

	return data;
});
</script>

<template>
	<SourceBase
		v-if="source"
		v-bind="imageData.bind"
		:transformer="transform(imageData.bind)"
		:operations="imageData.operations"
	/>
	<ImageBase
		v-else
		v-bind="imageData.bind"
		:transformer="transform(imageData.bind)"
		:operations="imageData.operations"
		:alt="alt ?? ((typeof src !== 'string' && (src.alt || src.title)) || '')"
	/>
</template>
