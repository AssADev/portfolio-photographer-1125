<script setup lang="ts">
import { computed } from 'vue';

import StoryblokComponent from '#components/utils/StoryblokComponent.vue';

import type { StoryblokAsset, StoryblokLabelLink, StoryblokProjectLayout } from '#types/component-types-sb.js';

import ProjectItemPicture from '#storyblok/partials/project/ProjectItemPicture.vue';
import ProjectItemVideo from '#storyblok/partials/project/ProjectItemVideo.vue';

// Props :
const { blok, layouts, pictures } = defineProps<{
	blok: StoryblokProjectLayout;
	socials: StoryblokLabelLink[];
	layouts: string[][];
	pictures: StoryblokAsset[];
}>();

// Components :
const ItemsComponents = {
	ProjectItemPicture,
	ProjectItemVideo
};

// Computed :
const limitedItems = computed(() => blok.items.slice(0, layouts.length));

// Methods :
const getGlobalIndex = (item: any) => {
	if (item.component !== 'ProjectItemPicture') return undefined;
	return pictures.findIndex((p) => p.id === item.picture.id || p.filename === item.picture.filename);
};
</script>

<template>
	<div :class="['partials-project-layout-base', { 'is-reversed': blok.isReversed }]">
		<div v-for="(item, index) in limitedItems" :key="item._uid" class="container-grid">
			<StoryblokComponent
				:components="ItemsComponents"
				:blok="item"
				:socials="socials"
				:class="layouts[index % layouts.length]"
				:index="getGlobalIndex(item)"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-project-layout-base {
	&.is-reversed {
		.container-grid {
			direction: rtl;

			> :deep(*) {
				direction: ltr;
			}
		}
	}
}

.container-grid {
	margin-block: fluidSize(200px, 150px);
}
</style>
