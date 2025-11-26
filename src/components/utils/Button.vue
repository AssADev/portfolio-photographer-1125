<script setup lang="ts">
import { computed } from 'vue';

const { to, is, type, disabled, target, rel } = defineProps<{
	is?: 'button' | 'a';
	to?: string;
	disabled?: boolean;
	type?: 'button' | 'submit';
	text?: string;
	target?: string;
	rel?: string;
	theme?: 'light' | 'dark';
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
		<slot>{{ text }}</slot>
	</component>
</template>

<style lang="scss" scoped>
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
}
</style>
