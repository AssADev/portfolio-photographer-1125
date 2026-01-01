<script setup lang="ts">
import type { StoryblokServiceFAQ } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceFAQ;
}>();
</script>

<template><div>ServiceFAQ</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
