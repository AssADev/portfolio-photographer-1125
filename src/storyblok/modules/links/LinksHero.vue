<script setup lang="ts">
import { StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, h } from 'vue';

import { getLocale } from '#utils/i18n.ts';
import { getLinkAttributes } from '#utils/link.ts';
import { nl2br } from '#utils/nl2br.ts';

import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokLabelLink, StoryblokLinksHero } from '#types/component-types-sb.js';

import vParallax from '#directives/vParallax.ts';

// Props :
defineProps<{
	blok: StoryblokLinksHero;
	email: string;
	socials: StoryblokLabelLink[];
}>();

// Variables :
const locale = getLocale();
const homeUrl = locale === 'fr' ? '/' : `/${locale}`;

// Resolvers (RichText) :
const resolvers = {
	paragraph: (node: StoryblokRichTextNode<VNode>) =>
		h('h1', h(StoryblokRichText, { doc: { type: 'doc', content: node.content } }))
};
</script>

<template>
	<section class="modules links-hero">
		<div class="background-container">
			<picture>
				<Image
					v-parallax="{ startAtZero: true, value: 12 }"
					source
					media="tablet"
					layout="fullWidth"
					:aspect-ratio="1440 / 810"
					:src="blok.backgroundDesktop"
					:alt="blok.backgroundDesktop.alt || 'Links Hero - Background (Desktop)'"
					:sizes="{ widescreen: '2560px' }"
				/>
				<Image
					v-parallax="{ startAtZero: true, value: 14 }"
					unstyled
					layout="fullWidth"
					:aspect-ratio="375 / 810"
					:src="blok.backgroundMobile"
					:alt="blok.backgroundMobile.alt || 'Links Hero - Background (Mobile)'"
					:sizes="{ tablet: '768px' }"
				/>
			</picture>
		</div>
		<div class="container">
			<p v-if="blok.description" class="description" v-html="nl2br(blok.description)" />
			<div class="content-container">
				<RichText :doc="blok.title" :resolvers="resolvers" />
				<ul class="socials-container">
					<li v-if="email" class="small-item">
						<a :href="`mailto:${email}`" :data-cursor-label="$t('email')">
							<Icon name="email" />
						</a>
					</li>
					<li class="small-item">
						<a :href="homeUrl" :data-cursor-label="$t('website')">
							<Icon name="website" />
						</a>
					</li>
					<li v-for="social in socials" :key="social._uid">
						<a v-bind="getLinkAttributes(social.link)">
							<span>{{ social.label }}</span>
						</a>
					</li>
				</ul>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.links-hero {
	z-index: 1;
	height: 100vh;
	overflow: hidden;
}

.background-container {
	position: absolute;
	inset: 0;

	img {
		@include img-fill;
	}
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
	text-align: center;

	& > :deep(.partials-rich-text) {
		@include roobert-96;

		margin-block-end: 20px;

		em {
			@include romie-96-italic;
		}
	}
}

.socials-container {
	gap: 10px;
	width: 100%;
	color: $eerieBlack;

	@include mq($until: tablet) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
	}

	@include mq(tablet) {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	li {
		width: 100%;
		height: 40px;

		&:nth-child(odd):last-child {
			@include mq($until: tablet) {
				grid-column: span 2;
			}
		}

		&.small-item {
			@include mq(tablet) {
				width: 40px;
				flex: 0 0 auto;
			}
		}
	}

	a {
		@include roobert-12-uppercase;

		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		height: 100%;
		background: $whiteChoco;
	}
}
</style>
