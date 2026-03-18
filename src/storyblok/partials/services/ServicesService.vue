<script setup lang="ts">
import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { nl2br } from '#utils/nl2br.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokRichtext } from '#types/component-types-sb.js';

// Props :
defineProps<{
	url: string;
	title: StoryblokRichtext;
	summary?: string;
	hoverScale?: number;
	isColumn?: boolean;
	animationDirection?: 'up' | 'down';
}>();

// Resolvers :
const resolvers = getRichTextResolvers('h2');
</script>

<template>
	<Button
		v-animate="{ type: 'mask-reveal', options: { direction: animationDirection || 'down' } }"
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
				<hr v-animate="{ type: 'scale-up', options: { withoutOpacity: true } }" />
				<RichText
					v-animate="{ type: 'reveal-letters', options: { delay: 0.1 } }"
					prefix="/"
					:resolvers="resolvers"
					:doc="title"
				/>
				<p
					v-if="summary"
					v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.15 } }"
					class="summary"
					v-html="nl2br(summary)"
				></p>
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
		transition: transform 0.8s $power2Out;

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
		padding: fluidSize(5px, 2px) 8px fluidSize(7px, 6px);
		overflow: hidden;

		span {
			@include roobert-14-uppercase;

			text-wrap: nowrap;
		}
	}

	.content-wrapper {
		position: relative;
		display: flex;
		gap: fluidSize(24px, 20px);
		width: 100%;
		padding-block-start: fluidSize(24px, 20px);

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

	hr {
		position: absolute;
		top: 0;
		width: 100%;
		height: 1px;
		background: $white;
	}

	:deep(.partials-rich-text) {
		@include roobert-48;

		display: flex;
	}

	.summary {
		@include roobert-18;

		width: fluidSize(460px, 320px, null, widescreen);

		@include mq(tablet) {
			margin-block-start: 2px;
		}
	}
}
</style>
