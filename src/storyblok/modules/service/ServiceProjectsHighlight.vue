<script setup lang="ts">
import Image from '#components/utils/Image.vue';

import type { StoryblokServiceProjectsHighlight } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceProjectsHighlight;
}>();
</script>

<template>
	<section class="modules service-projects-highlight">
		<div class="container"></div>
	</section>
</template>

<style lang="scss" scoped>
.service-projects-highlight {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
