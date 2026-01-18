<script setup lang="ts">
import CircularStar from '#components/utils/CircularStar.vue';

import type { StoryblokQuotes } from '#types/component-types-sb.js';

import QuotesItem from '#storyblok/partials/QuotesItem.vue';

// Props :
defineProps<{
	blok: StoryblokQuotes;
}>();

// Layouts :
const layouts = [
	[
		'col-start-1',
		'col-end-12',
		'col-start-tb-2',
		'col-end-tb-12',
		'col-start-dk-4',
		'col-end-dk-20',
		'col-start-lg-4',
		'col-end-lg-18',
		'col-start-xxlg-3',
		'col-end-xxlg-17'
	],
	[
		'col-start-2',
		'col-end-13',
		'col-start-tb-6',
		'col-end-tb-16',
		'col-start-dk-12',
		'col-end-dk-28',
		'col-start-lg-14',
		'col-end-lg-28',
		'col-start-xxlg-12',
		'col-end-xxlg-26'
	],
	[
		'col-start-1',
		'col-end-12',
		'col-start-tb-4',
		'col-end-tb-14',
		'col-start-dk-7',
		'col-end-dk-23',
		'col-start-lg-8',
		'col-end-lg-22',
		'col-start-xxlg-7',
		'col-end-xxlg-21'
	]
];
</script>

<template>
	<section
		class="modules quotes"
		:class="{ 'with-circular-star': blok.circularStar }"
		:data-cursor-projects="blok.cursorProjects || undefined"
	>
		<div v-if="blok.circularStar" class="circular-star-wrapper">
			<CircularStar :scroll-speed="0.5" />
		</div>
		<div class="container-grid">
			<QuotesItem
				v-for="(quote, index) in blok.quotes"
				:key="quote._uid"
				:blok="quote"
				:class="layouts[index % layouts.length]"
			/>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.quotes {
	padding-block: fluidSize(160px, 120px) fluidSize(120px, 80px);

	&.with-circular-star {
		@include pseudo-gradient('before', 'top', 'ivory-white-transparent', 1, fluidSize(360px, 280px));

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
			@include svh(125, height);
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

:deep(.quotes-item-wrapper) {
	&:not(:first-child) {
		margin-block-start: fluidSize(150px, 120px);
	}
}
</style>
