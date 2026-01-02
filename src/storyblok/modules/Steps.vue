<script setup lang="ts">
import CircularStar from '#components/utils/CircularStar.vue';

import type { StoryblokSteps } from '#types/component-types-sb.js';

import StepsItem from '#storyblok/partials/StepsItem.vue';

// Props :
defineProps<{
	blok: StoryblokSteps;
}>();

// Layouts :
const layouts = [
	[
		'col-start-1',
		'col-end-11',
		'col-start-tb-2',
		'col-end-tb-10',
		'col-start-dk-5',
		'col-end-dk-15',
		'col-start-lg-5',
		'col-end-lg-14',
		'col-start-xlg-5',
		'col-end-xlg-13',
		'col-start-xxlg-5',
		'col-end-xxlg-12'
	],
	[
		'col-start-3',
		'col-end-13',
		'col-start-tb-7',
		'col-end-tb-15',
		'col-start-dk-19',
		'col-end-dk-29',
		'col-start-lg-18',
		'col-end-lg-27',
		'col-start-xlg-18',
		'col-end-xlg-26',
		'col-start-xxlg-17',
		'col-end-xxlg-24'
	],
	[
		'col-start-1',
		'col-end-11',
		'col-start-tb-4',
		'col-end-tb-12',
		'col-start-dk-8',
		'col-end-dk-18',
		'col-start-lg-8',
		'col-end-lg-17',
		'col-start-xlg-8',
		'col-end-xlg-16',
		'col-start-xxlg-8',
		'col-end-xxlg-15'
	]
];
</script>

<template>
	<section class="modules steps" :class="{ 'with-circular-star': blok.circularStar }">
		<div v-if="blok.circularStar" class="circular-star-wrapper">
			<CircularStar :scroll-speed="0.5" />
		</div>
		<div class="container-grid">
			<StepsItem
				v-for="(step, index) in blok.steps"
				:key="step._uid"
				:blok="step"
				:index="index"
				:layout="layouts[index % layouts.length]"
			/>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.steps {
	padding-block: fluidSize(160px, 120px) fluidSize(120px, 80px);

	&.with-circular-star {
		.container-grid {
			z-index: 1;
		}
	}
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
			height: 125vh;
		}

		@include mq($until: large) {
			transform: translate3d(0, -50%, 0);
		}

		@include mq(desktop) {
			width: var(--ctn-w);
			transform: translate3d(0, -50%, 0);
		}

		@include mq(large) {
			transform: translate3d(0, -57.5%, 0);
		}

		@include mq(xlarge) {
			transform: translate3d(0, -60%, 0);
		}
	}
}

:deep(.steps-item-wrapper) {
	@include mq($until: desktop) {
		&:not(:first-child) {
			margin-block-start: fluidSize(120px, 10px, null, desktop);
		}
	}

	@include mq(desktop) {
		&:nth-child(2) {
			margin-block-start: fluidSize(160px, 120px);
		}
	}
}
</style>
