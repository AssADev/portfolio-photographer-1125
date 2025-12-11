<script setup lang="ts">
import RichText from '#components/utils/RichText.vue';
import StoryblokComponent from '#components/utils/StoryblokComponent.vue';

import type { StoryblokBiographyStrangersPortraits } from '#types/component-types-sb.js';

import BiographyStrangersPortraitsExplanation from '#storyblok/partials/biography/BiographyStrangersPortraitsExplanation.vue';
import BiographyStrangersPortraitsVideo from '#storyblok/partials/biography/BiographyStrangersPortraitsVideo.vue';

// Props :
defineProps<{
	blok: StoryblokBiographyStrangersPortraits;
	socials: any[];
}>();

// Components :
const SectionsComponents = {
	BiographyStrangersPortraitsExplanation,
	BiographyStrangersPortraitsVideo
};
</script>

<template>
	<section class="modules biography-strangers-portraits">
		<div class="container-grid">
			<RichText
				:doc="blok.title"
				class="col-start-1 col-end-13 col-start-tb-1 col-end-tb-15 col-start-dk-1 col-end-dk-23 col-start-xlg-1 col-end-xlg-21 col-start-xxlg-1 col-end-xxlg-19"
			/>
		</div>
		<div class="sections-container">
			<StoryblokComponent
				v-for="(section, index) in blok.sections"
				:key="section._uid"
				:components="SectionsComponents"
				:blok="section"
				:index="index"
				:socials="socials"
			/>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.biography-strangers-portraits {
	@include pseudo-gradient('before', 'top', 'white-ivory');
	@include pseudo-gradient('after', 'bottom', 'ivory-white');

	position: relative;
	background: $ivory;
	padding-block: fluidSize(160px, 120px) fluidSize(120px, 80px);
}

.container-grid {
	:deep(.partials-rich-text) {
		@include roobert-96;

		z-index: 1;
		margin-block-end: fluidSize(65px, 45px);

		em {
			@include romie-96-italic;
		}
	}
}

.sections-container {
	position: relative;
	z-index: 1;
}
</style>
