<script setup lang="ts">
import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { nl2br } from '#utils/nl2br.ts';

import RichText from '#components/utils/RichText.vue';

import type { StoryblokLabelLink, StoryblokServiceOffer, StoryblokServiceOffers } from '#types/component-types-sb.js';

import ServiceOffer from '#storyblok/partials/service/ServiceOffer.vue';

// Props :
defineProps<{
	blok: StoryblokServiceOffers;
	offers: StoryblokServiceOffer[];
	serviceBookingFormLink: StoryblokLabelLink[];
}>();

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h2');
</script>

<template>
	<section id="service-offers" class="modules service-offers">
		<div class="container">
			<div class="title-wrapper">
				<RichText v-animate="'reveal-titles'" :doc="blok.title" :resolvers="resolvers" />
				<p v-animate="'reveal-paragraphs'" v-html="nl2br(blok.description)" />
			</div>
			<div class="offers-container">
				<ServiceOffer
					v-for="(offer, index) in offers"
					:key="offer._uid"
					:blok="offer"
					:serviceBookingFormLink="serviceBookingFormLink"
					:index="index"
				/>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.service-offers {
	margin-block-start: fluidSize(56px, 24px, null, xxlarge);
	padding-block: fluidSize(56px, 24px, null, xxlarge) fluidSize(72px, 48px, null, xxlarge);
}

.title-wrapper {
	display: flex;
	flex-direction: column;
	gap: fluidSize(12px, 8px);

	& > p {
		@include roobert-18;

		max-width: fluidSize(540px, 360px);
	}
}

:deep(.partials-rich-text) {
	@include roobert-48;

	em {
		@include romie-48-italic;
	}
}

.offers-container {
	display: flex;
	gap: $gap;
	margin-block-start: fluidSize(72px, 48px);

	@include mq($until: desktop) {
		flex-direction: column;
	}
}
</style>
