<script setup lang="ts">
import { computed } from 'vue';

import Icon from '#components/utils/Icon.vue';

const { to, is, type, disabled, target, rel, theme } = defineProps<{
	is?: 'button' | 'a';
	to?: string;
	disabled?: boolean;
	type?: 'button' | 'submit';
	text?: string;
	target?: string;
	rel?: string;
	theme?: 'dot-khaki' | 'dot-light' | 'dot-dark' | 'light' | 'dark';
}>();

const isAnchor = is === 'a' || !!to;

const attrs = computed(() => ({
	href: isAnchor ? to : undefined,
	type: !isAnchor ? type || 'button' : undefined,
	disabled: (disabled && !isAnchor) || undefined,
	'aria-disabled': disabled || undefined,
	target: target,
	rel: target === '_blank' ? rel || 'noopener noreferrer' : rel
}));
</script>

<template>
	<component
		:is="isAnchor ? 'a' : 'button'"
		v-bind="attrs"
		:class="[{ 'partials-button': !!theme }, theme && `theme-${theme}`]"
	>
		<div v-if="theme?.startsWith('dot')" class="dot-wrapper">
			<Icon name="square-small" />
			<span>{{ text }}</span>
			<Icon name="square-small" />
		</div>
		<slot v-else>{{ text }}</slot>
	</component>
</template>

<style lang="scss" scoped>
@use 'sass:map';

.partials-button {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;

	&:disabled {
		pointer-events: none;
	}

	& > :deep(span) {
		position: relative;
	}

	:deep(svg) {
		flex-shrink: 0;
	}

	// Themes :
	//// Dot :
	@mixin dot-theme($bg-color, $text-color) {
		position: relative;
		border-radius: 3px;
		background: $bg-color;
		color: $text-color;
		padding: 5px 8px fluidSize(7px, 6px) 18px;
		overflow: hidden;

		@include hover {
			span {
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

		.dot-wrapper {
			display: flex;

			span {
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

	&.theme-dot-khaki {
		@include dot-theme($khaki, $eerieBlack);
	}

	&.theme-dot-light {
		@include dot-theme($whiteChoco, $eerieBlack);
	}

	&.theme-dot-dark {
		@include dot-theme($eerieBlack, $white);
	}
}
</style>
