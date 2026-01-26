<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { computed } from 'vue';

import type { StoryblokHomeLayout, StoryblokProject } from '#types/component-types-sb.js';

import HomeItemProject from '#storyblok/partials/home/HomeItemProject.vue';

// Props :
const { blok, layouts, projects } = defineProps<{
	blok: StoryblokHomeLayout;
	layouts: string[][];
	layoutName: string;
	projects: ISbStoryData<StoryblokProject>[];
}>();

// Computed :
const limitedProjects = computed(() => {
	return (blok.projects.filter((p) => typeof p !== 'string') as ISbStoryData<StoryblokProject>[]).slice(
		0,
		layouts.length
	);
});

// Methods :
const getGlobalIndex = (project: ISbStoryData<StoryblokProject>) => {
	return projects.findIndex((p) => p.id === project.id);
};
</script>

<template>
	<div :class="['partials-home-layout-base', layoutName, { 'is-reversed': blok.isReversed }]">
		<div v-for="(project, index) in limitedProjects" :key="project.id" class="container-grid">
			<HomeItemProject
				:project="project"
				:class="layouts[index % layouts.length]"
				:index="getGlobalIndex(project)"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.partials-home-layout-base {
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
