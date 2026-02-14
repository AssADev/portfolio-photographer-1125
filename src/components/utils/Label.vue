<script setup lang="ts">
import { computed } from 'vue';

import Icon from '#components/utils/Icon.vue';

// Props :
const { label } = defineProps<{ label: string }>();

// Computed :
const delay = computed(() => {
	return label.length * 0.075 + 0.025;
});
</script>

<template>
	<div class="partials-label">
		<Icon v-animate="'scale-up'" name="square-small" />
		<p v-animate="'reveal-letters'">{{ label }}</p>
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
}
</style>
