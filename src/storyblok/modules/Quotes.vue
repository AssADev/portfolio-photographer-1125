<script setup lang="ts">
import type { StoryblokQuotes } from '#types/component-types-sb.js';

defineProps<{
	blok: StoryblokQuotes;
}>();
</script>

<template><div>Quotes</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
