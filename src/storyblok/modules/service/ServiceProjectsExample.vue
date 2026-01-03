<script setup lang="ts">
import type { StoryblokServiceProjectsExample } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceProjectsExample;
}>();
</script>

<template>
	<section class="modules service-projects-example">
		<div class="container"></div>
	</section>
</template>

<style lang="scss" scoped>
.service-projects-example {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
