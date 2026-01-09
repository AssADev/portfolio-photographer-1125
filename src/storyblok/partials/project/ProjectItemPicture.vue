<script setup lang="ts">
import Button from '#components/utils/Button.vue';
import Image from '#components/utils/Image.vue';

import type { StoryblokProjectItemPicture } from '#types/component-types-sb.js';

import vMagnetic from '#directives/vMagnetic.ts';
import vParallax from '#directives/vParallax.ts';

// Props :
defineProps<{
	blok: StoryblokProjectItemPicture;
}>();
</script>

<template>
	<Button
		class="partials-project-item-picture"
		:data-cursor-label="$t('scaleUp')"
		v-magnetic="{
			strength: 0.1,
			parallax: { target: '.picture-wrapper', strength: 0.025 }
		}"
	>
		<div class="picture-wrapper">
			<Image
				:src="blok.picture"
				object-fit="contain"
				v-parallax="8"
				:sizes="[{ widescreen: '2560px' }, '100vw']"
			/>
		</div>
	</Button>
</template>

<style lang="scss" scoped>
.partials-project-item-picture {
	overflow: hidden;
}
</style>
