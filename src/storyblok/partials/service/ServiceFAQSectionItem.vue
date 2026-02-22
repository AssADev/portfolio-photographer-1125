<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ref, watch } from 'vue';

import LabelShuffle from '#components/partials/LabelShuffle.vue';
import Button from '#components/utils/Button.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokServiceFAQSectionItem } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceFAQSectionItem;
}>();

// Refs :
const isToggled = ref(false);

// Variables :
const transitionDuration = 0.6;

// Watchers :
watch(isToggled, () => {
	setTimeout(() => {
		ScrollTrigger.refresh();
	}, transitionDuration * 1000);
});
</script>

<template>
	<div class="partials-service-faq-section-item" :class="{ toggle: isToggled }">
		<Button class="question-header" @click="isToggled = !isToggled">
			<LabelShuffle v-animate="'reveal-label-shuffle'" :label="blok.question" no-snap reveal />
		</Button>
		<div class="question-answer-container" :inert="!isToggled">
			<div class="question-answer-wrapper">
				<div class="question-answer">
					<RichText :doc="blok.answer" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-service-faq-section-item {
	display: flex;
	flex-direction: column;
	border-top: 1px solid $white;

	&.toggle {
		.question-answer-container {
			grid-template-rows: 1fr;
			transition: grid-template-rows v-bind("transitionDuration + 's'") $power2Out;
		}
	}
}

.question-header {
	padding-block: fluidSize(16px, 12px) fluidSize(20px, 16px);

	.partials-label-shuffle {
		@include roobert-14-uppercase;
	}
}

.question-answer-container {
	display: grid;
	grid-template-rows: 0fr;
	transition: grid-template-rows v-bind("transitionDuration + 's'") $power2InOut;
	overflow: hidden;
}

.question-answer-wrapper {
	min-height: 0;
}

.question-answer {
	color: $grey;
	max-width: fluidSize(460px, 320px);
	padding-block-end: fluidSize(40px, 32px);

	& > :deep(.partials-rich-text) {
		@include roobert-14;

		& > * {
			margin-block-start: fluidSize(10px, 8px) !important;
		}

		a {
			position: relative;
			transition: color 0.4s $power2Out;

			@include hover {
				color: $white;

				&::before {
					background: $white;
					transform: scale3d(0, 1, 1);
					transform-origin: right center;
				}
			}

			&::before {
				content: '';
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 1px;
				background: $grey;
				transform-origin: left center;
				transition:
					transform 0.4s $power2Out,
					background 0.4s $power2Out;
			}
		}

		ol,
		ul {
			all: revert;
			padding-inline-start: fluidSize(16px, 12px);
			margin-block: 0;
		}

		ul {
			list-style: square;
		}
	}
}
</style>
