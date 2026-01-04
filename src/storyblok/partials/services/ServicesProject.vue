<script setup lang="ts">
import Icon from '#components/utils/Icon.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokRichtext } from '#types/component-types-sb.js';

// Props :
defineProps<{
	url: string;
	label: StoryblokRichtext;
	cursorLabel?: string;
	hoverScale?: number;
}>();
</script>

<template>
	<a
		:href="url"
		class="partials-services-project"
		:data-cursor-label="cursorLabel || $t('discoverProject')"
		:style="{ '--hover-scale': hoverScale || 1.0175 }"
	>
		<d≈iv class="picture-wrapper">
			<picture>
				<slot name="image" />
			</picture>
		</d≈iv>
		<div class="content-container">
			<div class="name-container">
				<div class="dot-wrapper">
					<Icon name="square-small" />
					<RichText :doc="label" />
					<Icon name="square-small" />
				</div>
			</div>
			<div v-if="$slots.info" class="informations-wrapper">
				<slot name="info" />
			</div>
		</div>
	</a>
</template>

<style lang="scss" scoped>
.partials-services-project {
	position: relative;
	display: block;
	overflow: hidden;
	width: 100%;
	height: 100%;

	@include hover {
		.picture-wrapper {
			transform: scale3d(var(--hover-scale), var(--hover-scale), 1);
		}

		.content-container .name-container {
			:deep(.partials-rich-text) {
				transform: translate3d(-10px, 0, 0);
			}

			svg {
				&:first-of-type {
					transform: translate3d(0, -50%, 0) scale3d(0, 0, 0) rotate(90deg);
					transition: transform 0.4s $power2Out;
				}

				&:last-of-type {
					transform: translate3d(0, -50%, 0) scale3d(1, 1, 1);
					transition: transform 0.4s $elasticOut 0.2s;
				}
			}
		}
	}

	.picture-wrapper {
		width: 100%;
		height: 100%;
		transition: transform 0.6s $elasticOut;
	}

	:deep(img) {
		@include img-fill;
	}
}

.content-container {
	position: absolute;
	bottom: 0;
	left: 0;
	display: flex;
	gap: 10px;
	width: 100%;
	padding: 20px;

	@include mq($until: tablet) {
		flex-direction: column;
	}

	@include mq(tablet) {
		align-items: center;
		justify-content: space-between;
	}
}

.name-container {
	position: relative;
	border-radius: 3px;
	color: $eerieBlack;
	background: $whiteChoco;
	padding: 5px 8px fluidSize(7px, 6px) 18px;
	overflow: hidden;
	width: fit-content;

	.dot-wrapper {
		display: flex;

		:deep(.partials-rich-text) {
			@include roobert-14-uppercase;

			text-wrap: nowrap;
			transition: transform 0.4s $power2Out 0.1s;
		}

		svg {
			position: absolute;

			&:first-of-type {
				left: 8px;
				top: 50%;
				transform: translate3d(0, -50%, 0);
				transition: transform 0.4s $elasticOut 0.2s;
			}

			&:last-of-type {
				right: 8px;
				top: 50%;
				transform: translate3d(0, -50%, 0) scale3d(0, 0, 0) rotate(90deg);
				transition: transform 0.4s $power2Out;
			}
		}
	}
}

.informations-wrapper {
	display: flex;
	align-items: center;
	gap: 10px;
}

:slotted(.informations-label) {
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
</style>
