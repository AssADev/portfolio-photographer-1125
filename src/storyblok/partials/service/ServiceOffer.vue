<script setup lang="ts">
import { getLinkAttributes } from '#utils/link.ts';
import { nl2br } from '#utils/nl2br.ts';
import { trackFormOpenClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import Icon from '#components/utils/Icon.vue';

import type { StoryblokLabelLink, StoryblokServiceOffer } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceOffer;
	serviceBookingFormLink: StoryblokLabelLink[];
	index: number;
}>();
</script>

<template>
	<div
		v-animate="{ type: 'mask-reveal', options: { direction: 'down', delay: index * 0.125 } }"
		class="partials-service-offer"
		:class="{ 'is-popular': blok.isPopular }"
	>
		<CircularStar
			v-if="blok.isPopular"
			v-animate="{ type: 'scale-up', options: { delay: 0.725 + index * 0.125, reset: true } }"
			:scroll-speed="-1"
		/>
		<div class="header-container">
			<div class="title-wrapper">
				<h3 v-animate="{ type: 'reveal-letters', options: { delay: 0.275 + index * 0.125 } }">
					{{ blok.title }}
				</h3>
				<p
					v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.25 + index * 0.125 } }"
					v-html="nl2br(blok.description)"
				/>
			</div>
			<div class="informations-wrapper">
				<div class="price-wrapper">
					<span v-animate="{ type: 'reveal-letters', options: { delay: 0.4 + index * 0.125 } }">{{
						blok.price
					}}</span>
					<span
						v-animate="{ type: 'reveal-letters', options: { delay: 0.4 + index * 0.125 } }"
						class="currency"
						>€</span
					>
				</div>
				<div class="duration-wrapper">
					<span v-animate="{ type: 'reveal-letters', options: { delay: 0.4 + index * 0.125 } }"
						>/{{ blok.duration }}h</span
					>
				</div>
			</div>
		</div>
		<ul class="items-container">
			<li>
				<Icon v-animate="{ type: 'scale-up', options: { delay: 0.4 + index * 0.125 } }" name="checkmark" />
				<span v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.275 + index * 0.125 } }">{{
					$t('offersEditedPhotos', { n: blok.numberOfEditedPhotos })
				}}</span>
			</li>
			<li>
				<Icon v-animate="{ type: 'scale-up', options: { delay: 0.4 + index * 0.125 } }" name="checkmark" />
				<span v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.275 + index * 0.125 } }">{{
					$t('offersPrivateGallery')
				}}</span>
			</li>
			<li v-if="blok.numberOfBlackAndWhitePhotos.length">
				<Icon v-animate="{ type: 'scale-up', options: { delay: 0.4 + index * 0.125 } }" name="checkmark" />
				<span v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.275 + index * 0.125 } }">{{
					$t('offersBlackAndWhitePhotos', { n: blok.numberOfBlackAndWhitePhotos })
				}}</span>
			</li>
			<li v-if="blok.additionalOption">
				<Icon v-animate="{ type: 'scale-up', options: { delay: 0.4 + index * 0.125 } }" name="checkmark" />
				<span v-animate="{ type: 'reveal-paragraphs', options: { delay: 0.275 + index * 0.125 } }">{{
					blok.additionalOption
				}}</span>
			</li>
		</ul>
		<div v-if="serviceBookingFormLink?.[0]" class="link-container">
			<Button
				v-animate="{ type: 'reveal-button-dot', options: { delay: index * 0.125 } }"
				v-bind="getLinkAttributes(serviceBookingFormLink[0])"
				:text="serviceBookingFormLink[0].label || $t('bookYourPhotoSession')"
				:link="serviceBookingFormLink[0].link"
				@click="
					trackFormOpenClick($event, {
						formId: (serviceBookingFormLink[0].link.story as any)?.content?.id
					})
				"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-service-offer {
	position: relative;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	width: 100%;
	border: 1px solid rgba($eerieBlack, 0.1);

	&.is-popular {
		background: $whiteChoco;

		.link-container {
			button {
				@include hover {
					background: $whiteChoco;
				}
			}
		}
	}

	&:not(.is-popular) {
		background: $ivory;

		.link-container {
			button {
				@include hover {
					background: $ivory;
				}
			}
		}
	}
}

:deep(.partials-circular-star) {
	position: absolute;
	top: 0;
	right: 0;
	transform: translate3d(50%, -50%, 0);
	width: 125%;
}

.header-container {
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: fluidSize(50px, 40px);
	height: 100%;
	padding: fluidSize(22px, 18px) fluidSize(20px, 18px) fluidSize(26px, 20px);
}

.title-wrapper {
	display: flex;
	flex-direction: column;
	gap: fluidSize(12px, 8px);

	& > h3 {
		@include romie-48-italic;
	}

	& > p {
		@include roobert-18;

		padding-inline-end: fluidSize(24px, 20px, null, tablet);
	}
}

.informations-wrapper {
	display: flex;
	align-items: flex-end;
	gap: fluidSize(16px, 12px);
}

.price-wrapper {
	span {
		&:first-child {
			@include roobert-56;
		}

		&:last-child {
			@include roobert-28-light;
		}
	}
}

.duration-wrapper {
	color: $grey;
	margin-block-end: 4px;

	span {
		@include roobert-28-light;
	}
}

.items-container {
	position: relative;
	border-top: 1px solid rgba($eerieBlack, 0.1);

	& > li {
		display: flex;
		align-items: center;
		gap: fluidSize(16px, 12px);
		padding: fluidSize(20px, 18px);
		border-bottom: 1px solid rgba($eerieBlack, 0.1);

		svg {
			color: $eerieBlack;
		}

		span {
			@include roobert-18;
		}
	}
}

.link-container {
	position: relative;
	padding: fluidSize(20px, 18px);

	button {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		border-radius: 4px;
		background: $eerieBlack;
		padding-block: fluidSize(12px, 10px);
		border: 1px solid rgba($eerieBlack, 0.1);
		transition: background 0.4s $power2Out;
		overflow: hidden;

		@include hover {
			:deep(span) {
				color: $eerieBlack;
			}
		}

		:deep(span) {
			@include roobert-16-uppercase;

			position: relative;
			color: $white;
			transition: color 0.4s $power2Out;
		}
	}
}
</style>
