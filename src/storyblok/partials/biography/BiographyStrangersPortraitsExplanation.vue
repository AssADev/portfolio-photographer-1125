<script setup lang="ts">
import gsap from 'gsap';

import { formatIndex } from '#utils/formatIndex.ts';
import { getLinkAttributes } from '#utils/link.ts';
import { nl2br } from '#utils/nl2br.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import LabelShuffle from '#components/partials/LabelShuffle.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokBiographyStrangersPortraitsExplanation, StoryblokLabelLink } from '#types/component-types-sb.js';

import vMagnetic from '#directives/vMagnetic.ts';

// Props :
defineProps<{
	blok: StoryblokBiographyStrangersPortraitsExplanation;
	index: number;
	socials: StoryblokLabelLink[];
	delay: number;
}>();
</script>

<template>
	<div
		v-animate="{
			type: 'mask-reveal',
			options: { direction: 'right', delay }
		}"
		class="partials-biography-strangers-portraits-explanation"
		:class="{ [index % 2 === 0 ? 'even-theme' : 'odd-theme']: true }"
	>
		<CircularStar
			v-animate="{ type: 'scale-up', options: { delay: delay + 0.8, reset: true } }"
			:scroll-speed="0.25"
		/>
		<div class="inner-container">
			<div class="content-container">
				<div
					class="number-wrapper hide-mobile"
					v-animate="{ type: 'reveal-button-dot', options: { delay: delay + 0.25 } }"
				>
					<span>{{ formatIndex(index + 1) }}</span>
				</div>
				<RichText
					v-animate="{
						type: 'reveal-titles',
						options: { delay: delay + 0.6 }
					}"
					:doc="blok.title"
				/>
				<p
					v-animate="{
						type: 'reveal-paragraphs',
						options: { delay: delay + 0.4 }
					}"
					v-html="nl2br(blok.description)"
				/>
			</div>
			<ul v-if="socials.length" class="socials-wrapper">
				<li
					v-for="(social, index) in socials"
					:key="social._uid"
					v-animate="{
						type: 'fade-in',
						options: { delay: delay + 0.8 + index * 0.1 }
					}"
				>
					<a
						v-bind="getLinkAttributes(social.link)"
						@click="trackNavigationClick"
						v-magnetic="{ strength: 0.1 }"
					>
						<LabelShuffle :label="social.label!" no-snap />
					</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-biography-strangers-portraits-explanation {
	position: relative;
	flex: 0 0 auto;
	width: fluidSize(680px, 360px, null, desktop);
	overflow: hidden;
	border: 1px solid rgba($eerieBlack, 0.1);

	&.even-theme {
		background: $whiteChoco;

		.socials-wrapper {
			a {
				background: rgba($whiteChoco, 0.8);
			}
		}
	}

	&.odd-theme {
		background: $ivory;

		.socials-wrapper {
			a {
				background: rgba($ivory, 0.8);
			}
		}
	}
}

:deep(.partials-circular-star) {
	position: absolute;
	top: 50%;
	left: 0;
	transform: translate3d(-50%, -50%, 0);
	height: 200%;
}

.inner-container {
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
	padding: fluidSize(28px, var(--gutter));

	@include mq(tablet) {
		padding-inline-end: calc(var(--gutter) * 3);
	}
}

.number-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	aspect-ratio: 1 / 1;
	border-radius: var(--border-radius);
	background: $eerieBlack;
	margin-block-end: fluidSize(20px, 16px);

	span {
		@include roobert-16-uppercase;

		color: $white;
	}
}

.content-container {
	max-width: fluidSize(380px, 340px);

	:deep(.partials-rich-text) {
		@include roobert-48;

		margin-block-end: fluidSize(20px, 16px);

		em {
			@include romie-48-italic;
		}
	}

	& > p {
		@include roobert-18;
	}
}

.socials-wrapper {
	display: flex;
	flex-wrap: wrap;
	gap: $gap;

	li {
		a {
			position: relative;
			display: flex;
			padding: 8px 16px;
			border: 1px solid rgba($eerieBlack, 0.25);
			border-radius: var(--border-radius);
			transition:
				color 0.4s $power2Out,
				background 0.4s $power2Out,
				border-color 0.4s $power2Out;

			@include hover {
				color: $white;
				background: $eerieBlack;
				border-color: $eerieBlack;
			}

			.partials-label-shuffle {
				@include roobert-12-uppercase;
			}
		}
	}
}
</style>
