<script setup lang="ts">
import RichText from '#components/utils/RichText.vue';

import type { StoryblokQuotesItem } from '#types/component-types-sb.js';

defineProps<{
	blok: StoryblokQuotesItem;
	layout: string[];
}>();
</script>

<template>
	<div class="quotes-item-wrapper" :class="layout">
		<RichText :doc="blok.content" />
	</div>
</template>

<style lang="scss" scoped>
.quotes-item-wrapper {
	@include roobert-28;

	max-width: fluidSize(620px, 480px);

	:deep(em) {
		@include romie-28-italic;
	}
}
</style>
