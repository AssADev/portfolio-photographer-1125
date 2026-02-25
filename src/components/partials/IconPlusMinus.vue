<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
	active?: boolean;
}>();

// Refs :
const isMinus = ref(false);

// Watchers :
watch(
	() => props.active,
	(val: boolean | undefined) => {
		if (val !== undefined) isMinus.value = val;
	},
	{ immediate: true }
);

// Methods :
const toggleMinus = (force?: boolean) => {
	isMinus.value = force !== undefined ? force : !isMinus.value;
};

// Expose :
defineExpose({
	toggleMinus
});
</script>

<template>
	<div class="partials-icon-plus-minus" :class="{ 'is-minus': isMinus }">
		<div class="inner-container">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.partials-icon-plus-minus {
	position: relative;
	width: 16px;
	height: 16px;
	aspect-ratio: 1/1;

	&.is-minus {
		.inner-container {
			transform: rotate(90deg);

			& > div {
				&:nth-child(1) {
					transform: translate3d(0, -50%, 0) scale3d(0, 1, 1);
				}
				&:nth-child(2) {
					transform: translate3d(0, -50%, 0) scale3d(0, 1, 1);
				}
			}
		}
	}

	.inner-container {
		position: relative;
		width: 100%;
		height: 100%;
		transition: transform 0.6s $power2Out;

		& > div {
			--length: calc((100% / 2) - 1px);
			--thickness: 2px;

			position: absolute;
			background: $white;
			transition: transform 0.6s $power2Out;

			&:nth-child(1) {
				top: 50%;
				left: 0;
				transform: translate3d(0, -50%, 0);
				transform-origin: right center;
				width: var(--length);
				height: var(--thickness);
			}

			&:nth-child(2) {
				top: 50%;
				right: 0;
				transform: translate3d(0, -50%, 0);
				transform-origin: left center;
				width: var(--length);
				height: var(--thickness);
			}

			&:nth-child(3) {
				top: 0;
				left: 50%;
				transform: translate3d(-50%, 0, 0);
				width: var(--thickness);
				height: var(--length);
			}

			&:nth-child(4) {
				bottom: 0;
				left: 50%;
				transform: translate3d(-50%, 0, 0);
				width: var(--thickness);
				height: var(--length);
			}
		}
	}
}
</style>
