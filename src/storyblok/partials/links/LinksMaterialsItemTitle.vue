<script setup lang="ts">
import type { StoryblokLinksMaterialsItemTitle } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokLinksMaterialsItemTitle;
}>();
</script>

<template>
	<div class="partials-links-materials-item item-title" :class="{ [`position-${blok.position}`]: true }">
		<h3 v-animate="'reveal-titles'">{{ blok.title }}</h3>
	</div>
</template>

<style lang="scss" scoped>
.partials-links-materials-item.item-title {
	display: flex;
	padding: fluidSize(20px, 14px);

	&.position-top-left {
		align-items: flex-start;
		justify-content: flex-start;
	}

	&.position-top-right {
		align-items: flex-start;
		justify-content: flex-end;
	}

	&.position-bottom-left {
		align-items: flex-end;
		justify-content: flex-start;
	}

	&.position-bottom-right {
		align-items: flex-end;
		justify-content: flex-end;
	}

	& > h3 {
		text-wrap: balance;

		@include mq($until: tablet) {
			@include roobert-28;
		}

		@include mq(tablet) {
			@include roobert-48;
		}
	}
}
</style>
