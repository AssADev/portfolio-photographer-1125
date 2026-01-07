<script setup lang="ts">
import type { StoryblokProjectItemPicture } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokProjectItemPicture;
}>();
</script>

<template><div>ProjectItemPicture</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
