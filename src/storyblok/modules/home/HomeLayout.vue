<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { computed } from 'vue';

import { HOME_LAYOUT_CONFIGS } from '#utils/homeLayouts.ts';

import type { StoryblokHomeLayout, StoryblokProject } from '#types/component-types-sb.js';

import HomeLayoutBase from '#storyblok/partials/home/layouts/HomeLayoutBase.vue';

// Props :
const { blok } = defineProps<{
	blok: StoryblokHomeLayout;
	projects: ISbStoryData<StoryblokProject>[];
}>();

// Config :
const currentConfig = computed(() => HOME_LAYOUT_CONFIGS[blok.layout]);
</script>

<template>
	<section class="modules home-layout">
		<HomeLayoutBase
			v-if="currentConfig"
			:blok="blok"
			:layouts="currentConfig"
			:layout-name="blok.layout"
			:projects="projects"
		/>
	</section>
</template>

<style lang="scss" scoped>
.home-layout {
}
</style>
