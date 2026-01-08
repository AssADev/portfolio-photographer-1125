<script setup lang="ts">
import Button from '#components/utils/Button.vue';
import Image from '#components/utils/Image.vue';

import type { StoryblokProjectItemPicture } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokProjectItemPicture;
}>();
</script>

<template>
	<Button class="partials-project-item-picture" :data-cursor-label="$t('scaleUp')">
		<Image :src="blok.picture" object-fit="contain" />
	</Button>
</template>

<style lang="scss" scoped>
.partials-project-item-picture {
}
</style>
