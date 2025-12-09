<script setup lang="ts">
import CircularStar from '#components/utils/CircularStar.vue';
import Image from '#components/utils/Image.vue';

import type { StoryblokBiographyHero, StoryblokLabelLink } from '#types/component-types-sb.js';

import TitleDescriptionAndCta from '#storyblok/partials/TitleDescriptionAndCta.vue';

const { blok, email, socials } = defineProps<{
	blok: StoryblokBiographyHero;
	email: string;
	socials: StoryblokLabelLink[];
}>();

// console.log(blok);
</script>

<template>
	<section class="modules biography-hero">
		<div class="container-grid">
			<h1
				class="title col-start-1 col-end-13 col-start-dk-1 col-end-dk-20 col-start-xlg-1 col-end-xlg-16 col-start-xxlg-1 col-end-xxlg-14"
			>
				{{ blok.title }}
			</h1>
			<div class="picture-main-container col-start-1 col-end-13 col-start-dk-1 col-end-dk-18">
				<CircularStar />
				<div class="picture-wrapper">
					<Image
						:src="blok.picturePrimary"
						:aspect-ratio="740 / 890"
						:sizes="[{ desktop: '50vw', tablet: '80vw' }, '100vw']"
					/>
				</div>
				<div class="socials-container">
					<a v-if="email" :href="`mailto:${email}`">{{ email }}</a>
					<ul class="socials-wrapper">
						<li v-for="social in socials" :key="social._uid">
							<a :href="social.link.url" target="_blank" rel="noopener noreferrer">
								{{ social.label }}
							</a>
						</li>
					</ul>
				</div>
			</div>
			<div class="description-container col-start-1 col-end-11 col-start-dk-24 col-end-dk-33">
				<p v-if="blok.description">{{ blok.description }}</p>
				<div class="picture-wrapper">
					<Image
						:src="blok.pictureSecondary"
						:aspect-ratio="365 / 440"
						:sizes="[{ tablet: '25vw' }, '75vw']"
					/>
				</div>
			</div>
			<TitleDescriptionAndCta
				v-if="blok.titleDescriptionAndCta?.[0]"
				:data="blok.titleDescriptionAndCta?.[0]"
				class="col-start-1 col-end-13 col-start-dk-18 col-end-dk-28 col-start-lg-21 col-end-lg-29 col-start-xxlg-22 col-end-xxlg-28"
			/>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.biography-hero {
	overflow: hidden;
	padding-block-end: fluidSize(100px, 60px);

	@include mq($until: desktop) {
		padding-block-start: 5px;
	}
}

.title {
	@include roobert-96;

	z-index: 1;
}

.picture-main-container {
	position: relative;
	margin-block-start: fluidSize(210px, 140px);

	:deep(.partials-circular-star) {
		position: absolute;

		@include mq($until: tablet) {
			top: 0;
			left: 50%;
			transform: translate3d(-50%, -50%, 0);
			width: 100%;
		}

		@include mq(tablet) {
			top: 0;
			right: 0;
			transform: translate3d(50%, -50%, 0);
			width: fluidSize(460px, 380px);
		}
	}

	.picture-wrapper {
		position: relative;
		width: 100%;
	}

	.socials-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: fluidSize(28px, 20px);
		margin-block-start: fluidSize(20px, 16px);

		.socials-wrapper {
			display: flex;
			gap: fluidSize(16px, 12px);
		}

		li {
			display: flex;
		}

		a {
			@include roobert-12-uppercase;
		}
	}
}

.description-container {
	$gap: fluidSize(32px, 24px);

	position: relative;
	display: flex;
	flex-direction: column;
	gap: $gap;

	@include mq(tablet) {
		margin-block-start: fluidSize(210px, 140px);
	}

	& > p {
		@include roobert-18;

		@include mq(tablet) {
			position: absolute;
			top: 0;
			left: 0;
			transform: translate3d(0, calc(-100% - $gap), 0);
		}
	}

	.picture-wrapper {
		position: relative;
		width: 100%;
	}
}

:deep(.partials-title-description-and-cta) {
	@include mq($until: tablet) {
		max-width: 360px;
	}
}
</style>
