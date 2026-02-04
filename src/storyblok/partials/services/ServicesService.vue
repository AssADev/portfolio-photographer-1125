<script setup lang="ts">
import { nl2br } from '#utils/nl2br.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokRichtext } from '#types/component-types-sb.js';

// Props :
defineProps<{
	url: string;
	label: StoryblokRichtext;
	summary?: string;
	hoverScale?: number;
	isColumn?: boolean;
}>();
</script>

<template>
	<Button
		:to="url"
		class="partials-services-service"
		:data-cursor-label="$t('discoverService')"
		:style="{ '--hover-scale': hoverScale || 1.0175 }"
		@click="trackNavigationClick"
	>
		<div class="picture-wrapper">
			<picture>
				<slot name="image" />
			</picture>
		</div>
		<div class="content-container">
			<div v-if="$slots.info" class="informations-wrapper">
				<slot name="info" />
			</div>
			<div class="content-wrapper" :class="{ 'is-column': isColumn }">
				<h2 class="title-wrapper">/<RichText :doc="label" /></h2>
				<p v-if="summary" class="summary" v-html="nl2br(summary)"></p>
			</div>
		</div>
	</Button>
</template>

<style lang="scss" scoped>
.partials-services-service {
	position: relative;
	display: block;
	overflow: hidden;
	width: 100%;
	height: 100%;

	@include hover {
		.picture-wrapper {
			transform: scale3d(var(--hover-scale), var(--hover-scale), 1);
		}
	}

	.picture-wrapper {
		position: relative;
		height: 100%;
		transition: transform 0.8s $elasticOut;

		&::before {
			content: '';
			position: absolute;
			z-index: 1;
			inset: 0;
			background: linear-gradient(0deg, rgba($black, 0.4) 0%, rgba($black, 0) 100%);
		}
	}

	:deep(img) {
		@include img-fill;
	}

	.content-container {
		position: absolute;
		z-index: 2;
		inset: 0;
		display: flex;
		justify-content: space-between;
		padding: var(--gutter);
		padding-block-end: calc(var(--gutter) + fluidSize(12px, 8px));
		flex-direction: column;
		color: $white;
	}

	.informations-wrapper {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	:slotted(.informations-label),
	.informations-label {
		position: relative;
		border-radius: 3px;
		color: $white;
		background: $eerieBlack;
		padding: 5px 8px fluidSize(7px, 6px);
		overflow: hidden;

		span {
			@include roobert-14-uppercase;

			display: flex;
			text-wrap: nowrap;
		}
	}

	.content-wrapper {
		display: flex;
		gap: fluidSize(24px, 20px);
		width: 100%;
		padding-block-start: fluidSize(24px, 20px);
		border-top: 1px solid $white;

		&.is-column {
			@include mq($until: large) {
				flex-direction: column;
			}

			@include mq(large) {
				justify-content: space-between;
			}
		}

		&:not(.is-column) {
			@include mq($until: tablet) {
				flex-direction: column;
			}

			@include mq(tablet) {
				justify-content: space-between;
			}
		}
	}

	.title-wrapper {
		@include roobert-48;

		display: flex;
	}

	.summary {
		@include roobert-18;

		max-width: fluidSize(460px, 320px, null, widescreen);

		@include mq(tablet) {
			margin-block-start: 2px;
		}
	}
}
</style>
