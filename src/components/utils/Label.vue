<script setup lang="ts">
import { computed } from 'vue';

import Icon from '#components/utils/Icon.vue';

// Props :
const { label, initialDelay } = defineProps<{ label: string; initialDelay?: number }>();

// Computed :
const delay = computed(() => {
	return label.length * 0.075 + 0.025 + (initialDelay || 0);
});
</script>

<template>
	<div class="partials-label">
		<Icon v-animate="{ type: 'scale-up', options: { delay: initialDelay } }" name="square-small" />
		<p v-animate="{ type: 'reveal-letters', options: { delay: initialDelay } }">{{ label }}</p>
		<Icon v-animate="{ type: 'scale-up', options: { delay } }" name="square-small" />
	</div>
</template>

<style lang="scss" scoped>
.partials-label {
	display: flex;
	align-items: center;
	gap: 6px;
	color: $khaki;

	& > p {
		@include roobert-12-uppercase;
	}

	:deep(svg) {
		@include mq(large) {
			margin-block-start: fluidSize(4px, 2px, null, xxlarge);
		}
	}
}
</style>
