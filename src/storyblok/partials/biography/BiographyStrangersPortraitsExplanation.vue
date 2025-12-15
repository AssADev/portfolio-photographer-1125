<script setup lang="ts">
import { formatIndex } from '#utils/formatIndex.ts';
import { getLinkAttributes } from '#utils/link.ts';
import { nl2br } from '#utils/nl2br.ts';

import CircularStar from '#components/utils/CircularStar.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokBiographyStrangersPortraitsExplanation, StoryblokLabelLink } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokBiographyStrangersPortraitsExplanation;
	index: number;
	socials: StoryblokLabelLink[];
}>();
</script>

<template>
	<div
		class="partials-biography-strangers-portraits-explanation"
		:class="{ [index % 2 === 0 ? 'even-theme' : 'odd-theme']: true }"
	>
		<CircularStar />
		<div class="inner-container">
			<div class="content-container">
				<div class="number-wrapper">
					<span>{{ formatIndex(index + 1) }}</span>
				</div>
				<RichText :doc="blok.title" />
				<p v-html="nl2br(blok.description)" />
			</div>
			<ul v-if="socials.length" class="socials-wrapper">
				<li v-for="social in socials" :key="social._uid">
					<a v-bind="getLinkAttributes(social.link)">
						<span>{{ social.label }}</span>
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
	width: fluidSize(680px, 340px, null, desktop);
	overflow: hidden;
	border: 1px solid rgba($eerieBlack, 0.1);

	&.even-theme {
		background: $whiteChoco;
	}

	&.odd-theme {
		background: $ivory;
	}
}

:deep(.partials-circular-star) {
	position: absolute;
	top: 0;
	right: 0;
	transform: translate3d(50%, -50%, 0);
	width: 680px;
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
	border-radius: 8px;
	background: $eerieBlack;
	margin-block-end: fluidSize(28px, 20px);

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
	gap: 10px;

	li {
		a {
			position: relative;
			display: flex;
			padding: 8px 16px;
			border: 1px solid rgba($eerieBlack, 0.25);
			border-radius: 16px;
			transition:
				color 0.4s $power2Out,
				background 0.4s $power2Out,
				border-color 0.4s $power2Out;

			@include hover {
				color: $white;
				background: $eerieBlack;
				border-color: $eerieBlack;
			}

			span {
				@include roobert-12-uppercase;
			}
		}
	}
}
</style>
