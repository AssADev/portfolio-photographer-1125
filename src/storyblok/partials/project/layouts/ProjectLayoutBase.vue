<script setup lang="ts">
import { computed } from 'vue';

import StoryblokComponent from '#components/utils/StoryblokComponent.vue';

import type { StoryblokLabelLink, StoryblokProjectLayout } from '#types/component-types-sb.js';

import ProjectItemPicture from '#storyblok/partials/project/ProjectItemPicture.vue';
import ProjectItemVideo from '#storyblok/partials/project/ProjectItemVideo.vue';

// Props :
const { blok, layouts } = defineProps<{
	blok: StoryblokProjectLayout;
	socials: StoryblokLabelLink[];
	layouts: string[][];
	layoutName: string;
}>();

// Components :
const ItemsComponents = {
	ProjectItemPicture,
	ProjectItemVideo
};

// Computed :
const limitedItems = computed(() => blok.items.slice(0, layouts.length));
</script>

<template>
	<div :class="['partials-project-layout-base', layoutName]">
		<div class="container-grid">
			<StoryblokComponent
				v-for="(item, index) in limitedItems"
				:key="item._uid"
				:components="ItemsComponents"
				:blok="item"
				:socials="socials"
				:class="layouts[index % layouts.length]"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-project-layout-base {
	padding-block: fluidSize(75px, 50px);

	&.layout-one {
	}

	&.layout-two {
	}
}
</style>
