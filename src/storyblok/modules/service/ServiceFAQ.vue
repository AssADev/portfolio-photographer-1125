<script setup lang="ts">
import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { getLinkAttributes } from '#utils/link.ts';
import { nl2br } from '#utils/nl2br.ts';
import { trackFormOpenClick, trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import RichText from '#components/utils/RichText.vue';

import type {
	StoryblokLabelLink,
	StoryblokRichtext,
	StoryblokServiceFAQ,
	StoryblokServiceFAQSection
} from '#types/component-types-sb.js';

import ServiceFAQSection from '#storyblok/partials/service/ServiceFAQSection.vue';

// Props :
defineProps<{
	blok: StoryblokServiceFAQ;
	title: StoryblokRichtext;
	description: string;
	link?: StoryblokLabelLink[];
	sections?: StoryblokServiceFAQSection[];
}>();

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h2');
</script>

<template>
	<section id="service-faq" class="modules service-faq">
		<div class="inner-container">
			<div class="container-grid">
				<div
					class="title-wrapper col-start-1 col-end-13 col-start-tb-1 col-end-tb-6 col-start-dk-1 col-end-dk-10 col-start-lg-1 col-end-lg-8"
				>
					<RichText :doc="title" :resolvers="resolvers" />
				</div>
				<div
					class="description-wrapper col-start-1 col-end-13 col-start-tb-10 col-end-tb-16 col-start-dk-22 col-end-dk-32 col-start-lg-23 col-end-lg-32 col-start-xxlg-24 col-end-xxlg-31"
				>
					<p v-html="nl2br(description)" />
					<Button
						v-if="link?.[0]"
						v-bind="getLinkAttributes(link[0])"
						theme="dot-white"
						:text="link[0].label"
						:link="link[0].link"
						@click="
							link[0].link.component === 'Forms'
								? trackFormOpenClick($event, { formId: (link[0].link.story as any)?.content?.id })
								: trackNavigationClick
						"
					/>
				</div>
			</div>
			<div class="sections-container">
				<ServiceFAQSection v-for="section in blok.sections" :key="section._uid" :blok="section" />
				<ServiceFAQSection v-for="section in sections" :key="section._uid" :blok="section" />
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.service-faq {
	padding-block-start: fluidSize(20px, 12px);
}

.inner-container {
	color: $white;
	background: $smokyBlack;
	padding-block-start: fluidSize(72px, 48px);
}

.container-grid {
	margin-block-end: fluidSize(72px, 48px);
}

.title-wrapper {
	& > :deep(.partials-rich-text) {
		@include roobert-48;

		em {
			@include romie-48-italic;
		}
	}
}

.description-wrapper {
	display: flex;
	flex-direction: column;
	gap: fluidSize(20px, 16px);

	@include mq($until: tablet) {
		max-width: fluidSize(420px, 360px);
		margin-block-start: fluidSize(30px, 24px);
	}

	@include mq(tablet) {
		margin-block-start: fluidSize(18px, 10px);
	}

	& > p {
		@include roobert-18;
	}
}

.sections-container {
	@include container;

	@include mq($until: tablet) {
		& > :deep(.partials-service-faq-section):not(:first-child) {
			margin-block-start: fluidSize(72px, 48px, null, tablet);
		}
	}
}
</style>
