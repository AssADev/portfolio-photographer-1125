<script setup lang="ts">
import { computed } from 'vue';

import Icon from '#components/utils/Icon.vue';

import { $global } from '#stores/global.ts';

// Props :
const { to, is, type, disabled, target, rel, theme, link, text } = defineProps<{
	is?: 'button' | 'a';
	to?: string;
	disabled?: boolean;
	type?: 'button' | 'submit';
	text?: string;
	target?: string;
	rel?: string;
	theme?: 'dot-khaki' | 'dot-white' | 'dot-light' | 'dot-dark' | 'light' | 'dark';
	link?: any;
}>();

const isFormLink = link?.component === 'Forms' || link?.story?.content?.component === 'Forms';
const isAnchor = (is === 'a' || !!to || !!link) && !isFormLink;

// Computed :
const href = computed(() => (link ? `/${link.cached_url || link.url || ''}` : to));

const attrs = computed(() => ({
	href: isAnchor ? href.value : undefined,
	type: !isAnchor ? type || 'button' : undefined,
	disabled: (disabled && !isAnchor) || undefined,
	'aria-disabled': disabled || undefined,
	target: target,
	rel: target === '_blank' ? rel || 'noopener noreferrer' : rel
}));

// Methods :
const handleClick = (e: Event) => {
	if (isFormLink) {
		e.preventDefault();
		$global.setKey('isContactToggled', true);
		$global.setKey('contactFormId', link.story.content.id);
	}
};
</script>

<template>
	<component
		:is="isAnchor ? 'a' : 'button'"
		v-bind="attrs"
		:class="[{ 'partials-button': !!theme }, theme && `theme-${theme}`]"
		@click="handleClick"
	>
		<div v-if="theme?.startsWith('dot')" class="dot-wrapper">
			<Icon name="square-small" />
			<span>{{ text }}</span>
			<Icon name="square-small" />
		</div>
		<slot v-else-if="text">
			<span>{{ text }}</span>
		</slot>
		<slot v-else></slot>
	</component>
</template>

<style lang="scss" scoped>
.partials-button {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: fit-content;
	overflow: hidden;

	& > :deep(span) {
		position: relative;
	}

	:deep(svg) {
		flex-shrink: 0;
	}

	// Themes :
	//// Dot :
	@mixin dot-theme($text-color, $bg-color) {
		position: relative;
		border-radius: 3px;
		color: $text-color;
		background: $bg-color;
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
		@include dot-theme($eerieBlack, $khaki);
	}

	&.theme-dot-white {
		@include dot-theme($eerieBlack, $white);
	}

	&.theme-dot-light {
		@include dot-theme($eerieBlack, $whiteChoco);
	}

	&.theme-dot-dark {
		@include dot-theme($white, $eerieBlack);
	}
}
</style>
