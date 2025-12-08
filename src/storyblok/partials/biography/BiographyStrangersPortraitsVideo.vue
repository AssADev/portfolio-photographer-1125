<script setup lang="ts">
import type { StoryblokBiographyStrangersPortraitsVideo } from '#types/component-types-sb.js';

defineProps<{
	blok: StoryblokBiographyStrangersPortraitsVideo;
}>();
</script>

<template><div>BiographyStrangersPortraitsVideo</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
