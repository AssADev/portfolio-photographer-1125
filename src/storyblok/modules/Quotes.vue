<script setup lang="ts">
import RichText from '#components/utils/RichText.vue';

import type { StoryblokQuotes } from '#types/component-types-sb.js';

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
	<section class="modules quotes">
		<div class="container-grid">
			<div
				v-for="(quote, index) in blok.quotes"
				:key="quote._uid"
				class="quote-wrapper"
				:class="layouts[index % layouts.length]"
			>
				<RichText :doc="quote.content" />
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.quotes {
	display: flex;
	align-items: center;
	justify-content: center;
	padding-block: fluidSize(160px, 120px) fluidSize(120px, 80px);
}

.quote-wrapper {
	@include roobert-28;

	max-width: fluidSize(620px, 480px);

	&:not(:first-child) {
		margin-block-start: fluidSize(150px, 120px);
	}

	:deep(em) {
		@include romie-28-italic;
	}
}
</style>
