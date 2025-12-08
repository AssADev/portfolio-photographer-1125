<script setup lang="ts">
import type { StoryblokQuotesItem } from '#types/component-types-sb.js';

defineProps<{
	blok: StoryblokQuotesItem;
}>();
</script>

<template><div>QuotesItem</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
