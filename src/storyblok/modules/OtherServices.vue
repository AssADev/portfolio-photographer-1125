<script setup lang="ts">
import type { StoryblokOtherServices } from '#types/component-types-sb.js';

defineProps<{
	blok: StoryblokOtherServices;
}>();
</script>

<template><div>OtherServices</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
