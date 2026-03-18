<script setup lang="ts">
import Icon from '#components/utils/Icon.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokRichtext } from '#types/component-types-sb.js';

defineProps<{
	name: StoryblokRichtext;
}>();
</script>

<template>
	<div class="partials-label-name">
		<div class="dot-wrapper">
			<Icon name="square-small" />
			<RichText :doc="name" />
			<Icon name="square-small" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-label-name {
	position: absolute;
	bottom: var(--gutter);
	left: var(--gutter);
	z-index: 2;
	overflow: hidden;
	width: fit-content;
	padding: 5px 8px fluidSize(7px, 6px) 18px;
	border-radius: 3px;
	background: $whiteChoco;
	color: $eerieBlack;
	pointer-events: none;

	.dot-wrapper {
		display: flex;

		:deep(.partials-rich-text) {
			@include roobert-14-uppercase;

			text-wrap: nowrap;
			transition: transform 0.4s $power2Out 0.1s;

			br {
				display: none;
			}
		}

		svg {
			position: absolute;
			top: 50%;

			&:first-of-type {
				left: 8px;
				transform: translate3d(0, -50%, 0);
				transition: transform 0.4s $elasticOut 0.2s;
			}

			&:last-of-type {
				right: 8px;
				transform: translate3d(0, -50%, 0) scale3d(0, 0, 0) rotate(90deg);
				transition: transform 0.4s $power2Out;
			}
		}
	}

	@at-root {
		@media (hover: hover) and (pointer: fine) {
			a:not(:disabled):hover &,
			button:not(:disabled):hover & {
				:deep(.partials-rich-text) {
					transform: translate3d(-10px, 0, 0);
					transition: transform 0.4s $power2Out;
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
	}
}
</style>
