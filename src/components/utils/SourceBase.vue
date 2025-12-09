<script setup lang="ts">
import { Source as UnpicSource } from '@unpic/vue/base';

import { type SourceBaseProps, parseMedia } from '#utils/image.ts';

const { media, ...props } = defineProps<SourceBaseProps>();
</script>

<template>
	<UnpicSource v-bind="props" :media="parseMedia(media)" />
</template>
