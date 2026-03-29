<script setup lang="ts">
import { computed, inject } from 'vue';

import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import locales from '#utils/locales.json';
import { nl2br } from '#utils/nl2br.ts';

import Button from '#components/utils/Button.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokServiceInformations } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceInformations;
}>();

// Injections :
const siteConfig = inject<any>('siteConfig');
const language = inject<string>('language');

// Computed :
const servicesLink = computed(() => {
	const servicesMenuItem = siteConfig?.menuLinks?.find((item: any) => item.link?.component === 'Services');

	if (servicesMenuItem) return servicesMenuItem.link.url;

	// Fallback :
	return language === locales[0] ? '/services' : `/${language}/services`;
});

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h1');
</script>

<template>
	<section class="modules service-hero">
		<div class="container-grid">
			<p
				v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.6 } }"
				class="summary col-start-3 col-end-13 col-start-tb-11 col-end-tb-15 col-start-dk-20 col-end-dk-28 col-start-lg-20 col-end-lg-27 col-start-xlg-20 col-end-xlg-26 col-start-xxlg-20 col-end-xxlg-25"
				v-html="nl2br(blok.summary)"
			></p>
		</div>
		<div class="container">
			<div class="title-wrapper">
				<RichText v-animate="'reveal-titles'" :doc="blok.name" :resolvers="resolvers" />
				<Button
					:to="servicesLink"
					v-animate="{ type: 'reveal-letters', options: { delay: 0.85 } }"
					data-cursor-snap
					>/{{ $t('service') }}</Button
				>
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
	gap: 2px;

	@include mq($until: tablet) {
		flex-direction: column;
	}

	@include mq(tablet) {
		align-items: flex-end;
	}

	& > a {
		@include roobert-12-uppercase;

		margin-block-start: fluidSize(8px, 6px, null, tablet);
		color: $khaki;
		transition: color 0.25s $power2Out;

		@include hover {
			color: $eerieBlack;
			transition: color 0.4s $power2Out 0.1s;
		}
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
