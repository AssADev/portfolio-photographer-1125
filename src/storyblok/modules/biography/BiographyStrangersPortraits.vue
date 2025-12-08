<script setup lang="ts">
import type { StoryblokBiographyStrangersPortraits } from '#types/component-types-sb.js';

defineProps<{
	blok: StoryblokBiographyStrangersPortraits;
}>();
</script>

<template><div>BiographyStrangersPortraits</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
