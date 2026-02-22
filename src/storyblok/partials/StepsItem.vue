<script setup lang="ts">
import { formatIndex } from '#utils/formatIndex.ts';
import { nl2br } from '#utils/nl2br.ts';
import { trackFormOpenClick, trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';

import type { StoryblokStepsItem } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokStepsItem;
	index: number;
}>();
</script>

<template>
	<div class="steps-item-wrapper">
		<div class="title-wrapper">
			<span class="number" v-animate="{ type: 'reveal-letters', options: { delay: 0.4 } }"
				>/{{ formatIndex(index + 1) }}</span
			>
			<h2 v-if="blok.title" v-animate="'reveal-titles'">{{ blok.title }}</h2>
		</div>
		<p v-if="blok.description" v-animate="'reveal-paragraphs'" v-html="nl2br(blok.description)" />
		<Button
			v-if="blok.cta?.[0]"
			v-animate="{ type: 'reveal-button-dot', options: { delay: 0.035 } }"
			theme="dot-dark"
			:text="blok.cta[0].label || $t('bookYourPhotoSession')"
			:link="blok.cta[0].link"
			@click="
				blok.cta[0].link.component === 'Forms'
					? trackFormOpenClick($event, { formId: (blok.cta[0].link.story as any)?.content?.id })
					: trackNavigationClick
			"
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
		transform: translate3d(-100%, -25%, 0);
	}
}
</style>
