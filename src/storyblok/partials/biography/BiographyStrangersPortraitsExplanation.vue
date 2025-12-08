<script setup lang="ts">
import type { StoryblokBiographyStrangersPortraitsExplanation } from '#types/component-types-sb.js';

defineProps<{
	blok: StoryblokBiographyStrangersPortraitsExplanation;
}>();
</script>

<template><div>BiographyStrangersPortraitsExplanation</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
