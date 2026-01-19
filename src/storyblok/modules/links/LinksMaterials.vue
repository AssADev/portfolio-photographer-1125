<script setup lang="ts">
import StoryblokComponent from '#components/utils/StoryblokComponent.vue';
import TitleDescription from '#components/utils/TitleDescription.vue';

import type { StoryblokLinksMaterials } from '#types/component-types-sb.js';

import LinksMaterialsItemEmpty from '#storyblok/partials/links/LinksMaterialsItemEmpty.vue';
import LinksMaterialsItemProduct from '#storyblok/partials/links/LinksMaterialsItemProduct.vue';
import LinksMaterialsItemTitle from '#storyblok/partials/links/LinksMaterialsItemTitle.vue';

// Props :
defineProps<{
	blok: StoryblokLinksMaterials;
}>();

// Components :
const MaterialsComponents = {
	LinksMaterialsItemEmpty,
	LinksMaterialsItemProduct,
	LinksMaterialsItemTitle
};
</script>

<template>
	<section class="modules links-materials">
		<div class="container">
			<TitleDescription :title="blok.title" :description="blok.description" />
			<div class="materials-container">
				<StoryblokComponent
					v-for="material in blok.materials"
					:key="material._uid"
					:components="MaterialsComponents"
					:blok="material"
					:style="{
						'grid-column': material.columnNumber ? `span ${material.columnNumber}` : undefined,
						'grid-row': material.rowNumber ? `span ${material.rowNumber}` : undefined
					}"
					:class="[material.hide]"
				/>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.links-materials {
	z-index: 1;
	padding-block: fluidSize(142px, 96px) fluidSize(112px, 96px);
	background: linear-gradient(
		180deg,
		rgba($white, 0) 0%,
		rgba($ivory, 1) 40%,
		rgba($ivory, 1) 60%,
		rgba($white, 0) 100%
	);
}

.materials-container {
	display: grid;
	grid-auto-rows: fluidSize(520px, 250px, null, xxlarge);

	@include mq($until: tablet) {
		grid-template-columns: repeat(2, 1fr);
	}

	@include mq(tablet) {
		grid-template-columns: repeat(4, 1fr);
	}
}

:deep(.partials-links-materials-item) {
	&.item-product,
	&.item-title {
		background: $white;
		border: 1px solid $eerieBlack;
		margin: -0.5px;
	}
}
</style>
