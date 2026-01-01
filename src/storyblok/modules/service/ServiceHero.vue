<script setup lang="ts">
import { StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, h } from 'vue';

import { nl2br } from '#utils/nl2br.ts';

import RichText from '#components/utils/RichText.vue';

import type { StoryblokServiceInformations } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceInformations;
}>();

// Resolvers (RichText) :
const resolvers = {
	paragraph: (node: StoryblokRichTextNode<VNode>) =>
		h('h1', h(StoryblokRichText, { doc: { type: 'doc', content: node.content } }))
};
</script>

<template>
	<section class="modules service-hero">
		<div class="container-grid">
			<p
				class="summary col-start-3 col-end-13 col-start-tb-11 col-end-tb-15 col-start-dk-20 col-end-dk-28 col-start-lg-20 col-end-lg-27 col-start-xlg-20 col-end-xlg-26 col-start-xxlg-20 col-end-xxlg-25"
				v-html="nl2br(blok.summary)"
			></p>
		</div>
		<div class="container">
			<div class="title-wrapper">
				<RichText :doc="blok.name" :resolvers="resolvers" />
				<div class="label">/{{ $t('service') }}</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.service-hero {
	padding-block: fluidSize(120px, 100px) fluidSize(60px, 40px);
}

.title-wrapper {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-end;
	gap: 2px;

	.label {
		@include roobert-12-uppercase;

		margin-block-start: fluidSize(8px, 6px, null, tablet);
		color: $khaki;
	}
}

:deep(.partials-rich-text) {
	@include roobert-96;

	em {
		@include romie-96-italic;
	}
}

.summary {
	@include roobert-14;

	max-width: fluidSize(420px, 380px);
	margin-block-end: fluidSize(60px, 45px);
}
</style>
