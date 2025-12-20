<script setup lang="ts">
import { StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, h } from 'vue';

import { nl2br } from '#utils/nl2br.ts';

import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokLabelLink, StoryblokLinksHero } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokLinksHero;
	email: string;
	socials: StoryblokLabelLink[];
}>();

// Resolvers (RichText) :
const resolvers = {
	paragraph: (node: StoryblokRichTextNode<VNode>) =>
		h('h1', h(StoryblokRichText, { doc: { type: 'doc', content: node.content } }))
};
</script>

<template>
	<section class="modules links-hero">
		<div class="background-container">
			<Image
				source
				media="tablet"
				layout="fullWidth"
				:aspect-ratio="375 / 810"
				:src="blok.backgroundMobile"
				:alt="blok.backgroundMobile.alt || 'Links Hero - Background (Mobile)'"
				:sizes="{ tablet: '768px' }"
			/>
			<Image
				unstyled
				layout="fullWidth"
				:aspect-ratio="1440 / 810"
				:src="blok.backgroundDesktop"
				:sizes="{ xxlarge: '1920px' }"
				:alt="blok.backgroundDesktop.alt || 'Links Hero - Background (Desktop)'"
			/>
		</div>
		<div class="container">
			<p v-if="blok.description" class="description" v-html="nl2br(blok.description)" />
			<div class="content-container">
				<RichText :doc="blok.title" :resolvers="resolvers" />
				<div class="socials-container">
					<a v-if="email" :href="`mailto:${email}`">{{ email }}</a>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.links-hero {
	height: 100vh;
	overflow: hidden;
}

.background-container {
	position: absolute;
	inset: 0;
}

.container {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	color: $white;
}

.description {
	@include roobert-14-uppercase;

	position: absolute;
	top: var(--gutter);
	left: 0;
}

.content-container {
	& > :deep(.partials-rich-text) {
		@include roobert-96;

		em {
			@include romie-96-italic;
		}
	}
}
</style>
