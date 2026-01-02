<script setup lang="ts">
import { formatIndex } from '#utils/formatIndex.ts';
import { nl2br } from '#utils/nl2br.ts';

import Button from '#components/utils/Button.vue';

import type { StoryblokStepsItem } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokStepsItem;
	index: number;
	layout: string[];
}>();
</script>

<template>
	<div class="steps-item-wrapper" :class="layout">
		<div class="title-wrapper">
			<span class="number">/{{ formatIndex(index + 1) }}</span>
			<h2 v-if="blok.title">{{ blok.title }}</h2>
		</div>
		<p v-if="blok.description" v-html="nl2br(blok.description)" />
		<Button
			v-if="blok.cta?.[0]"
			theme="dot-dark"
			:text="blok.cta[0].label || $t('bookYourPhotoSession')"
			:link="blok.cta[0].link"
		/>
	</div>
</template>

<style lang="scss" scoped>
.steps-item-wrapper {
	@include mq($until: desktop) {
		max-width: fluidSize(520px, 420px, null, desktop);
	}

	& > p {
		@include roobert-18;

		margin-block-start: fluidSize(32px, 24px);
	}

	& > :deep(.partials-button) {
		margin-block-start: fluidSize(16px, 12px);
	}
}

.title-wrapper {
	position: relative;

	@include mq($until: desktop) {
		display: flex;
		flex-direction: column;
		gap: fluidSize(6px, 4px, null, desktop);
	}

	& > h2 {
		@include roobert-48;
	}
}

.number {
	@include roobert-14-uppercase;

	color: $khaki;

	@include mq(desktop) {
		position: absolute;
		bottom: 0;
		left: calc(fluidSize(32px, 24px, null, widescreen) * -1);
		transform: translate3d(-100%, -50%, 0);
	}
}
</style>
