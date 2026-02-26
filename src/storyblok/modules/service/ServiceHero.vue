<script setup lang="ts">
import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { nl2br } from '#utils/nl2br.ts';

import RichText from '#components/utils/RichText.vue';

import type { StoryblokServiceInformations } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceInformations;
}>();

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h1');
</script>

<template>
	<section class="modules service-hero">
		<div class="container-grid">
			<p
				v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.125 } }"
				class="summary col-start-3 col-end-13 col-start-tb-11 col-end-tb-15 col-start-dk-20 col-end-dk-28 col-start-lg-20 col-end-lg-27 col-start-xlg-20 col-end-xlg-26 col-start-xxlg-20 col-end-xxlg-25"
				v-html="nl2br(blok.summary)"
			></p>
		</div>
		<div class="container">
			<div class="title-wrapper">
				<RichText v-animate="'reveal-titles'" :doc="blok.name" :resolvers="resolvers" />
				<p v-animate="{ type: 'reveal-letters', options: { delay: 0.85 } }">/{{ $t('service') }}</p>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.service-hero {
	padding-block: fluidSize(142px, 96px) fluidSize(56px, 32px);
}

.title-wrapper {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-end;
	gap: 2px;

	& > p {
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
	margin-block-end: fluidSize(72px, 48px);
}
</style>
