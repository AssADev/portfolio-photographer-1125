<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computed, onMounted, ref, useTemplateRef } from 'vue';

import { formatDateMonthYear } from '#utils/formatDate.ts';
import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { getLocale } from '#utils/i18n.ts';

import Button from '#components/utils/Button.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';
import Marquee from '#components/utils/Marquee.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProjectInformations, StoryblokService } from '#types/component-types-sb.js';

// Props :
const { blok } = defineProps<{
	blok: StoryblokProjectInformations;
}>();

// Refs :
const marqueePlaying = ref(true);
const sectionRef = useTemplateRef('sectionRef');

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h1');

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

// Pictures :
const pictures = computed(() => {
	return [blok.cover, blok.coverSmall];
});

// Attach :
onMounted(() => {
	ScrollTrigger.create({
		trigger: sectionRef.value,
		start: 'bottom bottom',
		end: 'bottom top',
		onUpdate: (self) => {
			sectionRef.value!.style.opacity = Number(1 - self.progress).toFixed(2);
		}
	});
});
</script>

<template>
	<section ref="sectionRef" class="modules project-hero">
		<div class="inner-container">
			<div class="circular-star-wrapper">
				<CircularStar :scroll-speed="1" />
			</div>
			<div class="marquee-container">
				<Marquee
					:speed="40"
					pause-on-hover
					:items="pictures"
					:scroll-speed="0.35"
					align-items="flex-start"
					v-model:playing="marqueePlaying"
				>
					<template #item="{ item }">
						<div class="picture-wrapper">
							<Image :src="item" object-fit="contain" />
						</div>
					</template>
				</Marquee>
			</div>
			<div class="container">
				<div class="title-container">
					<RichText :doc="blok.name" :resolvers="resolvers" />
					<div class="informations-container">
						<div v-for="information in informations" :key="information.label" class="information-wrapper">
							<div class="label-wrapper">
								<Icon name="square-small" />
								<span>{{ $t(information.label) }}</span>
								<Icon name="square-small" />
							</div>
							<template
								v-if="information.isLink && information.value && typeof information.value === 'object'"
							>
								<Button :to="information.value.full_slug" data-cursor-snap>
									<RichText class="value" :doc="information.value.content.informations[0].name" />
								</Button>
							</template>
							<p v-else class="value">{{ information.value }}</p>
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
	background: $white;
}

.inner-container {
	height: 100%;
	overflow: hidden;

	& > .container {
		min-height: fluidSize(810px, 780px);
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
		max-width: 350px;
		max-height: 300px;
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

		max-width: fluidSize(960px, 420px);
		margin-inline: auto;

		em {
			@include romie-96-italic;
		}
	}
}

.informations-container {
	position: absolute;
	bottom: calc(fluidSize(64px, 48px) * -1);
	left: 50%;
	transform: translate3d(-50%, +100%, 0);
	width: 100%;
	display: flex;
	max-width: fluidSize(1024px, 580px);
	margin-inline: auto;

	@include mq($until: tablet) {
		flex-direction: column;
		gap: fluidSize(40px, 32px);
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

	a {
		@include a11y-focus(-6px);

		position: relative;
		pointer-events: auto;
	}

	.value {
		@include roobert-18;
	}
}

.label-wrapper {
	display: flex;
	align-items: center;
	gap: fluidSize(6px, 4px);
	color: $khaki;

	span {
		@include roobert-14-uppercase;
	}
}
</style>
