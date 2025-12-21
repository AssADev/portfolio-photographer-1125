<script setup lang="ts">
import { getLinkAttributes } from '#utils/link.ts';

import Button from '#components/utils/Button.vue';
import Icon from '#components/utils/Icon.vue';
import Image from '#components/utils/Image.vue';

import type { StoryblokLinksMaterialsItemProduct } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokLinksMaterialsItemProduct;
}>();
</script>

<template>
	<Button v-bind="getLinkAttributes(blok.link)" is="a" class="partials-links-materials-item-product">
		<div class="informations-container">
			<div class="pretitle-wrapper">
				<Icon name="square-small" />
				<p>{{ blok.pretitle }}</p>
			</div>
			<p>{{ blok.title }}</p>
		</div>
		<div class="picture-container">
			<Image :src="blok.picture" :sizes="[{ desktop: '315px' }, '135px']" />
		</div>
	</Button>
</template>

<style lang="scss" scoped>
.partials-links-materials-item-product {
	padding: fluidSize(20px, 14px);

	@include hover {
		background: $whiteChoco;
	}
}

.informations-container {
	display: flex;
	flex-direction: column;
	gap: fluidSize(10px, 8px);
	margin-block-end: fluidSize(20px, 16px);

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
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 2px;
	background: $ivory;
}
</style>
