<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import type { ISbStoryData } from '@storyblok/js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computed, onMounted, ref, watch } from 'vue';

import type { StoryblokHomeLayout, StoryblokProject } from '#types/component-types-sb.js';

import { $currentFilter } from '#stores/filter.ts';
import HomeItemProject from '#storyblok/partials/home/HomeItemProject.vue';

// Props :
const { blok, layouts, projects } = defineProps<{
	blok: StoryblokHomeLayout;
	layouts: string[][];
	layoutName: string;
	projects: ISbStoryData<StoryblokProject>[];
}>();

// Refs :
const containerRefs = ref<HTMLElement[]>([]);

// Store :
const currentFilter = useStore($currentFilter);

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

const matchesFilter = (project: ISbStoryData<StoryblokProject>, filter: string) => {
	if (filter === 'allMyProjects') return true;

	const projectServices = project.content.informations?.[0]?.service;
	if (!projectServices) return false;

	return projectServices.some((s) => {
		if (typeof s === 'string') return s === filter;
		return s.slug === filter || s.uuid === filter;
	});
};

const updateVisibility = (animate = true) => {
	const tl = gsap.timeline({
		onComplete: () => {
			ScrollTrigger.refresh();
		}
	});

	containerRefs.value.forEach((el, index) => {
		const project = limitedProjects.value[index];
		const isMatch = matchesFilter(project, currentFilter.value);

		if (animate) {
			tl.to(
				el,
				{
					scale: isMatch ? 1 : 0,
					height: isMatch ? 'auto' : 0,
					opacity: isMatch ? 1 : 0,
					duration: 0.6,
					ease: 'power2.inOut',
					overflow: 'hidden',
					pointerEvents: isMatch ? 'all' : 'none'
				},
				0
			);
		} else {
			gsap.set(el, {
				scale: isMatch ? 1 : 0,
				height: isMatch ? 'auto' : 0,
				opacity: isMatch ? 1 : 0,
				overflow: isMatch ? 'visible' : 'hidden',
				pointerEvents: isMatch ? 'all' : 'none'
			});
		}
	});
};

// Watchers :
watch(currentFilter, () => {
	updateVisibility();
});

// Lifecycle :
onMounted(() => {
	updateVisibility(false);
});
</script>

<template>
	<div :class="['partials-home-layout-base', layoutName, { 'is-reversed': blok.isReversed }]">
		<div v-for="(project, index) in limitedProjects" :key="project.id" ref="containerRefs" class="container-grid">
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
	padding-block-end: fluidSize(200px, 150px);
}
</style>
