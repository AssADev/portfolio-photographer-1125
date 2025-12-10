<script setup lang="ts">
import Icon from '#components/utils/Icon.vue';

// Props :
defineProps<{ label: string }>();
</script>

<template>
	<div class="partials-label">
		<Icon name="square-small" />
		<p>{{ label }}</p>
		<Icon name="square-small" />
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
