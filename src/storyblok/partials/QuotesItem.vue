<script setup lang="ts">
import RichText from '#components/utils/RichText.vue';

import type { StoryblokQuotesItem } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokQuotesItem;
}>();
</script>

<template>
	<div class="quotes-item-wrapper">
		<RichText v-animate="'reveal-paragraphs'" :doc="blok.content" />
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
