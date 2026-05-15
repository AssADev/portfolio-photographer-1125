<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { useElementSize } from '@vueuse/core';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

import { formatDateMonthYear } from '#utils/formatDate.ts';
import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { getLocale } from '#utils/i18n.ts';
import { getMarqueeImageWidth } from '#utils/marquee.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import Image from '#components/utils/Image.vue';
import Label from '#components/utils/Label.vue';
import Marquee from '#components/utils/Marquee.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProjectInformations, StoryblokService } from '#types/component-types-sb.js';

// Props :
const { blok, pictures } = defineProps<{
	blok: StoryblokProjectInformations;
	pictures: string[];
}>();

// Refs :
const marqueePlaying = ref(true);
const sectionRef = useTemplateRef('sectionRef');
const marqueeRef = useTemplateRef('marqueeRef');

let st: ScrollTrigger | null = null;

const { height: marqueeHeight } = useElementSize(marqueeRef);

// Computed :
const scaledPictures = computed(() => {
	return pictures.map((url) => ({
		url,
		width: getMarqueeImageWidth(url)
	}));
});

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('span');

// Informations :
const informations = computed(() => {
	const serviceStory = blok.service?.[0];

	return [
		{
			label: 'date',
			value: formatDateMonthYear(blok.date, getLocale()),
			isLink: false
		},
		{
			label: 'service',
			value:
				serviceStory && typeof serviceStory !== 'string'
					? (serviceStory as ISbStoryData<StoryblokService>)
					: null,
			isLink: true
		},
		{
			label: 'location',
			value: blok.location,
			isLink: false
		}
	];
});

// Attach & Detach :
onMounted(() => {
	st = ScrollTrigger.create({
		trigger: sectionRef.value,
		start: 'bottom bottom',
		end: 'bottom top',
		onUpdate: (self) => {
			if (sectionRef.value) {
				sectionRef.value.style.opacity = Number(1 - self.progress).toFixed(2);
			}
		}
	});
});

onUnmounted(() => {
	st?.kill();
});
</script>

<template>
	<section ref="sectionRef" class="modules project-hero">
		<div class="inner-container">
			<div class="circular-star-wrapper">
				<CircularStar
					v-animate="{ type: 'scale-up', options: { delay: 0.85, reset: true } }"
					:scroll-speed="1"
				/>
			</div>
			<div ref="marqueeRef" class="marquee-container">
				<Marquee
					v-model:playing="marqueePlaying"
					:speed="40"
					:items="scaledPictures"
					:scroll-speed="0.35"
					align-items="flex-start"
				>
					<template #item="{ item, index }">
						<div
							v-animate="{
								type: 'mask-reveal',
								options: { direction: 'down', delay: index * 0.125, withTranslate: true }
							}"
							class="picture-wrapper"
							:style="{ '--picture-width': `${item.width}px` }"
						>
							<Image :src="item.url" object-fit="contain" />
						</div>
					</template>
				</Marquee>
			</div>
			<div class="container">
				<div class="title-container">
					<RichText v-animate="'reveal-titles'" :doc="blok.name" :resolvers="resolvers" tag="h1" />
					<div class="informations-container">
						<div v-for="information in informations" :key="information.label" class="information-wrapper">
							<Label :label="$t(information.label)" :initial-delay="0.55" />
							<template
								v-if="information.isLink && information.value && typeof information.value === 'object'"
							>
								<Button
									:to="information.value.full_slug"
									data-cursor-snap
									@click="trackNavigationClick"
								>
									<RichText
										v-animate="{ type: 'reveal-label-shuffle', options: { delay: 0.55 } }"
										reveal
										speed="normal"
										class="value"
										:doc="information.value.content.informations[0].name"
										shuffle
									/>
								</Button>
							</template>
							<p v-else v-animate="{ type: 'reveal-letters', options: { delay: 0.55 } }" class="value">
								{{ information.value }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.project-hero {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
}

.inner-container {
	height: 100%;
	overflow: hidden;

	& > .container {
		min-height: calc(fluidSize(810px, 780px) - v-bind("marqueeHeight + 'px'"));

		@include mq($until: desktop) {
			padding-block-end: fluidSize(96px, 64px, null, desktop);
		}
	}
}

.circular-star-wrapper {
	position: absolute;
	top: 0;
	left: 50%;
	transform: translate3d(-50%, 0, 0);
	overflow: hidden;
	pointer-events: none;

	:deep(.partials-circular-star) {
		@include mq($until: desktop) {
			@include svh(125, height);
		}

		@include mq($until: large) {
			transform: translate3d(0, -40%, 0);
		}

		@include mq(desktop) {
			width: var(--ctn-w);
		}

		@include mq(large) {
			transform: translate3d(0, -55%, 0);
		}

		@include mq(xlarge) {
			transform: translate3d(0, -60%, 0);
		}
	}
}

.marquee-container {
	@include pseudo-gradient('before', 'bottom', 'ivory-white-transparent', 1, fluidSize(320px, 160px));

	--marquee-gap: calc(var(--gutter) / 2);

	position: relative;
	display: flex;
	padding-block-end: fluidSize(20px, 16px);
	background: $ivory;

	&::before {
		transform: translate3d(0, 100%, 0);
	}

	:deep(.marquee-wrapper) {
		@include mq(widescreen) {
			@include container;

			mask-image: linear-gradient(
				90deg,
				rgba($white, 0) 0%,
				rgba($white, 1) calc(0% + 420px),
				rgba($white, 1) calc(100% - 420px),
				rgba($white, 0) 100%
			);
		}
	}

	:deep(.marquee-inner) {
		z-index: 1;
	}

	:deep(.picture-wrapper) {
		--width-ratio: 1;

		width: calc(var(--picture-width) / var(--width-ratio));
		max-width: 350px;
		max-height: 300px;

		@include mq($until: desktop) {
			--width-ratio: 1.375;
		}

		@include mq(desktop) {
			--width-ratio: 1.25;
		}

		@include mq(large) {
			--width-ratio: 1.125;
		}

		@include mq(xlarge) {
			--width-ratio: 1;
		}

		img {
			width: 100%;
			height: auto;
			max-width: inherit;
			max-height: inherit;
		}
	}
}

.container {
	position: absolute;
	z-index: 1;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
}

.title-container {
	position: relative;
	width: 100%;
	text-align: center;

	& > :deep(.partials-rich-text) {
		@include roobert-96;

		display: inline-block;
		max-width: fluidSize(960px, 420px);
		margin-inline: auto;

		em {
			@include romie-96-italic;
		}

		.reveal-titles-line-wrapper {
			margin-inline: auto;
		}
	}
}

.informations-container {
	position: absolute;
	bottom: calc(fluidSize(64px, 40px) * -1);
	left: 50%;
	transform: translate3d(-50%, +100%, 0);
	width: 100%;
	display: flex;
	max-width: fluidSize(1024px, 580px);
	margin-inline: auto;

	@include mq($until: tablet) {
		flex-direction: column;
		gap: fluidSize(40px, 28px);
	}

	@include mq(tablet) {
		justify-content: space-between;
	}
}

.information-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: fluidSize(8px, 6px);

	@include mq(tablet) {
		&:nth-child(2) {
			position: absolute;
			top: 0;
			left: 50%;
			transform: translate3d(-50%, 0, 0);
		}
	}

	& > :deep(.partials-label) {
		p {
			@include roobert-14-uppercase;
		}
	}

	a {
		@include a11y-focus(-6px);

		position: relative;
		pointer-events: auto;
	}

	.value {
		@include roobert-18;
	}
}
</style>
