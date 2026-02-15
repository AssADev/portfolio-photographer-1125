<script setup lang="ts">
import { getLinkAttributes } from '#utils/link.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';

import type { StoryblokLinksMaterialsItemProduct } from '#types/component-types-sb.js';

// Props :
const { blok } = defineProps<{
	blok: StoryblokLinksMaterialsItemProduct;
}>();

// Variables :
const columnNumber = Number(blok.columnNumber ?? 1);
</script>

<template>
	<Button
		v-bind="getLinkAttributes(blok.link)"
		is="a"
		class="partials-links-materials-item item-product"
		:data-cursor-label="$t('viewProduct')"
		@click="trackNavigationClick"
	>
		<div class="informations-container">
			<div class="pretitle-wrapper">
				<Icon name="square-small" />
				<p v-animate="'reveal-letters'">{{ blok.pretitle }}</p>
			</div>
			<p v-animate="'reveal-paragraphs'">{{ blok.title }}</p>
		</div>
		<div v-animate="'fade-in'" class="picture-container">
			<CircularStar />
			<div v-animate="'scale-up'" class="picture-wrapper">
				<Image
					objectFit="contain"
					:src="blok.picture"
					:sizes="[
						{
							xxlarge: `${590 * columnNumber}px`,
							large: `${440 * columnNumber}px`,
							desktop: `${315 * columnNumber}px`
						},
						`${135 * columnNumber}px`
					]"
				/>
			</div>
		</div>
	</Button>
</template>

<style lang="scss" scoped>
.partials-links-materials-item.item-product {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: fluidSize(20px, 14px);
	padding: fluidSize(20px, 14px);
	transition: background 0.4s $power2Out;

	@include hover {
		background: $whiteChoco;

		:deep(.partials-circular-star) {
			opacity: 1;
			transition: opacity 0.4s $power2Out 0.05s;
		}

		img {
			transform: scale3d(1.0325, 1.0325, 1);
		}
	}
}

.informations-container {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	gap: fluidSize(6px, 4px);

	& > p {
		@include roobert-18;
	}
}

.pretitle-wrapper {
	display: flex;
	align-items: center;
	gap: fluidSize(6px, 4px);
	color: $khaki;

	& > p {
		@include roobert-12-uppercase;
	}
}

.picture-container {
	position: relative;
	height: 100%;
	border-radius: 2px;
	background: $ivory;
	overflow: hidden;

	:deep(.partials-circular-star) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate3d(-50%, -50%, 0);
		width: 150%;
		opacity: 0;
		transition: opacity 0.4s $power2Out;
	}

	.picture-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: fluidSize(24px, 18px);

		img {
			transition: transform 0.6s $elasticOut;
		}
	}
}
</style>
