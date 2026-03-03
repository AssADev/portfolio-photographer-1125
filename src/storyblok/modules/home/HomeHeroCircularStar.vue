<script setup lang="ts">
import CircularStar from '#components/utils/CircularStar.vue';
</script>

<template>
	<div class="modules home-hero-circular-star">
		<div class="circular-star-wrapper">
			<CircularStar v-animate="{ type: 'scale-up', options: { delay: 0.85, reset: true } }" :scroll-speed="1" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.home-hero-circular-star {
	@include pseudo-gradient('before', 'top', 'ivory-white-transparent', 1, fluidSize(640px, 420px));
}

.circular-star-wrapper {
	position: absolute;
	top: 0;
	left: 50%;
	transform: translate3d(-50%, 0, 0);
	overflow: hidden;
	pointer-events: none;

	:deep(.partials-circular-star) {
		@include mq($until: desktop) {
			@include svh(125, height);
		}

		@include mq($until: large) {
			transform: translate3d(0, -50%, 0);
		}

		@include mq(desktop) {
			width: var(--ctn-w);
		}

		@include mq(large) {
			transform: translate3d(0, -55%, 0);
		}

		@include mq(xlarge) {
			transform: translate3d(0, -60%, 0);
		}
	}
}
</style>
