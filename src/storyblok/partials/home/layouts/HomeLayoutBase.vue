<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import type { ISbStoryData } from '@storyblok/js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/vue';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import type { StoryblokHomeLayout, StoryblokProject } from '#types/component-types-sb.js';

import { $currentFilter } from '#stores/filter.ts';
import HomeItemProject from '#storyblok/partials/home/HomeItemProject.vue';

// Props :
const { blok, layouts, projects } = defineProps<{
	blok: StoryblokHomeLayout;
	layouts: string[][];
	projects: ISbStoryData<StoryblokProject>[];
}>();

// Refs :
const lenis = useLenis();
let isTransitioning = false;

const layoutRef = ref<HTMLElement | null>(null);
const activeFilterKey = ref('allMyProjects');

// Store :
const currentFilter = useStore($currentFilter);

// Computed :
const limitedProjects = computed(() => {
	return (blok.projects.filter((p) => typeof p !== 'string') as ISbStoryData<StoryblokProject>[]).slice(
		0,
		layouts.length
	);
});

const displayedProjects = computed(() => {
	return limitedProjects.value.filter((p) => matchesFilter(p, activeFilterKey.value));
});

// Methods :
const matchesFilter = (project: ISbStoryData<StoryblokProject>, filter: string) => {
	if (filter === 'allMyProjects') return true;

	const projectServices = project.content.informations?.[0]?.service;
	if (!projectServices) return false;

	return projectServices.some((s) => {
		if (typeof s === 'string') return s === filter;
		return s.slug === filter || s.uuid === filter;
	});
};

const getFilteredIndex = (project: ISbStoryData<StoryblokProject>) => {
	const filteredAllProjects = projects.filter((p) => matchesFilter(p, activeFilterKey.value));
	return filteredAllProjects.findIndex((p) => p.id === project.id) + 1;
};

// Watchers :
watch(currentFilter, async (newVal, oldVal) => {
	if (newVal === oldVal || isTransitioning) return;
	isTransitioning = true;

	// 1. Fade out the layout smoothly while keeping scroll positions stable :
	if (layoutRef.value) {
		gsap.to(layoutRef.value, { opacity: 0, duration: 0.6, ease: 'power2.inOut' });
	}

	// 2. Scroll to Top smoothly :
	if (window.scrollY > 10) {
		if (lenis.value) {
			lenis.value.scrollTo(0, {
				duration: 1,
				easing: (t) => {
					return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
				}
			});
		} else {
			window.scrollTo({ top: 0, behavior: 'instant' });
		}

		// Wait for scroll duration :
		await new Promise((r) => setTimeout(r, 1200));
	} else {
		// Wait for fade out duration since there's no scroll :
		await new Promise((r) => setTimeout(r, 600));
	}

	// 3. Change the key & remount strictly filtered items :
	// We do this while opacity is still 0 so we don't see the DOM swap.
	activeFilterKey.value = newVal;
	await nextTick();

	// 4. Give GSAP an instant to initialize the v-animate 'from' hidden states
	// before bringing the wrapper's opacity back to 1. This prevents any raw DOM flashing.
	await new Promise((r) => setTimeout(r, 50));

	if (layoutRef.value) {
		gsap.set(layoutRef.value, { opacity: 1, clearProps: 'opacity' });
	}

	ScrollTrigger.refresh();
	isTransitioning = false;
});

// Attach :
onMounted(() => {
	activeFilterKey.value = currentFilter.value;
});
</script>

<template>
	<div ref="layoutRef" :class="['partials-home-layout-base', { 'is-reversed': blok.isReversed }]">
		<div
			v-for="(project, index) in displayedProjects"
			:key="`${project.id}-${activeFilterKey}`"
			class="container-grid"
		>
			<HomeItemProject
				:project="project"
				:class="layouts[index % layouts.length]"
				:index="getFilteredIndex(project)"
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
