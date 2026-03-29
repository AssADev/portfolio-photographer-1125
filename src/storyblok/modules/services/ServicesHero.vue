<script setup lang="ts">
import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { nl2br } from '#utils/nl2br.ts';

import RichText from '#components/utils/RichText.vue';

import type { StoryblokServicesHero } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServicesHero;
}>();

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h1');
</script>

<template>
	<section class="modules services-hero">
		<div class="container-grid">
			<RichText
				v-animate="'reveal-titles'"
				class="col-start-1 col-end-13 col-start-tb-1 col-end-tb-15 col-start-dk-1 col-end-dk-29 col-start-xlg-1 col-end-xlg-27 col-end-xxlg-1 col-end-xxlg-24"
				:doc="blok.title"
				:resolvers="resolvers"
			/>
			<div
				v-if="blok.subtitle || blok.description"
				class="description-wrapper col-start-3 col-end-13 col-start-tb-9 col-end-tb-16 col-start-dk-16 col-end-dk-28 col-start-mlg-19 col-end-mlg-29 col-start-xlg-21 col-end-xlg-29 col-start-xxlg-21 col-end-xxlg-28"
			>
				<p
					v-if="blok.subtitle"
					v-animate="{ type: 'reveal-letters-speed', options: { delay: 0.4 } }"
					class="subtitle"
					v-html="nl2br(blok.subtitle)"
				/>
				<p
					v-if="blok.description"
					v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.45 } }"
					class="description"
					v-html="nl2br(blok.description)"
				/>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.services-hero {
	padding-block-end: fluidSize(120px, 95px);

	@include mq($until: desktop) {
		padding-block-start: 5px;
	}

	:deep(.partials-rich-text) {
		@include roobert-96-smaller;

		em {
			@include romie-96-smaller-italic;
		}
	}
}

.description-wrapper {
	display: flex;
	flex-direction: column;
	gap: fluidSize(8px, 6px);
	margin-block-start: fluidSize(120px, 100px);

	@include mq($until: tablet) {
		max-width: 420px;
	}

	.subtitle {
		@include roobert-12-uppercase;

		color: $khaki;
	}

	.description {
		@include roobert-18;
	}
}
</style>
