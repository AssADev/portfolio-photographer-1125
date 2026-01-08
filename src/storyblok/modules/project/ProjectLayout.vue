<script setup lang="ts">
import StoryblokComponent from '#components/utils/StoryblokComponent.vue';

import type { StoryblokLabelLink, StoryblokProjectLayout } from '#types/component-types-sb.js';

import ProjectItemPicture from '#storyblok/partials/project/ProjectItemPicture.vue';
import ProjectItemVideo from '#storyblok/partials/project/ProjectItemVideo.vue';

// Props :
defineProps<{
	blok: StoryblokProjectLayout;
	socials: StoryblokLabelLink[];
}>();

// Components :
const ItemsComponents = {
	ProjectItemPicture,
	ProjectItemVideo
};
</script>

<template>
	<section class="modules project-layout">
		<div class="container-grid">
			<StoryblokComponent
				v-for="material in blok.items"
				:key="material._uid"
				:components="ItemsComponents"
				:blok="material"
				:socials="socials"
			/>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.project-layout {
}
</style>
