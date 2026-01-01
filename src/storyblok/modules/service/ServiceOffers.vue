<script setup lang="ts">
import type { StoryblokServiceOffers } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceOffers;
}>();
</script>

<template><div>ServiceOffers</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
