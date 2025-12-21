<script setup lang="ts">
import { StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, h } from 'vue';

import { nl2br } from '#utils/nl2br.ts';

import RichText from '#components/utils/RichText.vue';
import StoryblokComponent from '#components/utils/StoryblokComponent.vue';

import type { StoryblokLinksMaterials } from '#types/component-types-sb.js';

import LinksMaterialsItemEmpty from '#storyblok/partials/links/LinksMaterialsItemEmpty.vue';
import LinksMaterialsItemProduct from '#storyblok/partials/links/LinksMaterialsItemProduct.vue';
import LinksMaterialsItemTitle from '#storyblok/partials/links/LinksMaterialsItemTitle.vue';

// Props :
defineProps<{
	blok: StoryblokLinksMaterials;
}>();

// Resolvers (RichText) :
const resolvers = {
	paragraph: (node: StoryblokRichTextNode<VNode>) =>
		h('h2', h(StoryblokRichText, { doc: { type: 'doc', content: node.content } }))
};

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
			<div class="title-container">
				<RichText v-if="blok.title" :doc="blok.title" :resolvers="resolvers" />
				<p v-if="blok.description" v-html="nl2br(blok.description)" />
			</div>
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
	padding-block: fluidSize(120px, 80px) fluidSize(100px, 80px);
	background: linear-gradient(
		180deg,
		rgba($white, 0) 0%,
		rgba($ivory, 1) 40%,
		rgba($ivory, 1) 60%,
		rgba($white, 0) 100%
	);
}

.title-container {
	display: flex;
	flex-direction: column;
	gap: fluidSize(12px, 10px);
	max-width: fluidSize(540px, 360px);
	margin-block-end: fluidSize(48px, 36px);

	& > :deep(.partials-rich-text) {
		@include roobert-48;

		em {
			@include romie-48-italic;
		}
	}

	& > p {
		@include roobert-18;
	}
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
