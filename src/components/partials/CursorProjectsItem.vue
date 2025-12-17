<script setup lang="ts">
import { ref } from 'vue';

// Props :
defineProps<{
	x: number;
	y: number;
	rotation: number;
}>();

// Refs :
const el = ref<HTMLElement | null>(null);
defineExpose({ el });

// Make a random color :
const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
</script>

<template>
	<div
		ref="el"
		class="partials-cursor-projects-item"
		:style="{
			transform: `translate3d(${x}px, ${y}px, 0) scale3d(0, 0, 1)`
		}"
	>
		<div class="inner"></div>
	</div>
</template>

<style lang="scss" scoped>
.partials-cursor-projects-item {
	position: absolute;
	transform-origin: 0% 0%;
	transform: scale3d(0, 0, 1);
	will-change: transform, opacity;
}

.inner {
	width: 200px;
	height: 200px;
	background-color: v-bind(color);
	overflow: hidden;
	transform: translate3d(-50%, -50%, 0);
}
</style>
