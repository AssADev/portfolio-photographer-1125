<script setup lang="ts">
import { nl2br } from '#utils/nl2br.ts';

import Button from '#components/utils/Button.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import Icon from '#components/utils/Icon.vue';

import type { StoryblokServiceOffer } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokServiceOffer;
}>();
</script>

<template>
	<div class="partials-service-offer" :class="{ 'is-popular': blok.isPopular }">
		<CircularStar v-if="blok.isPopular" :scroll-speed="-1" />
		<div class="header-container">
			<div class="title-wrapper">
				<h3>{{ blok.title }}</h3>
				<p v-html="nl2br(blok.description)" />
			</div>
			<div class="informations-wrapper">
				<div class="price-wrapper">
					<span>{{ blok.price }}</span>
					<span class="currency">€</span>
				</div>
				<div class="duration-wrapper">
					<span>/{{ blok.duration }}h</span>
				</div>
			</div>
		</div>
		<ul class="items-container">
			<li>
				<Icon name="checkmark" />
				<span>{{ $t('offersEditedPhotos', { n: blok.numberOfEditedPhotos }) }}</span>
			</li>
			<li>
				<Icon name="checkmark" />
				<span>{{ $t('offersPrivateGallery') }}</span>
			</li>
			<li>
				<Icon name="checkmark" />
				<span>{{ $t('offersBlackAndWhitePhotos', { n: blok.numberOfBlackAndWhitePhotos }) }}</span>
			</li>
		</ul>
		<div class="link-container">
			<Button :text="$t('bookYourPhotoSession')" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-service-offer {
	position: relative;
	overflow: hidden;
	width: 100%;
	border: 1px solid rgba($eerieBlack, 0.1);

	&.is-popular {
		background: $whiteChoco;
	}

	&:not(.is-popular) {
		background: $ivory;
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
	gap: fluidSize(50px, 40px);
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
	padding: fluidSize(20px, 18px);
}
</style>
