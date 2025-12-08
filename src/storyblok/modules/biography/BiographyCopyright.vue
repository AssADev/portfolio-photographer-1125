<script setup lang="ts">
import type { StoryblokBiographyCopyright } from '#types/component-types-sb.js';

defineProps<{
	blok: StoryblokBiographyCopyright;
}>();
</script>

<template><div>BiographyCopyright</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
