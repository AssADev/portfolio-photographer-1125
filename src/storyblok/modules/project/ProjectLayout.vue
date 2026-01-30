<script setup lang="ts">
import { computed } from 'vue';

import { PROJECT_LAYOUT_CONFIGS } from '#utils/projectLayouts.ts';

import type { StoryblokAsset, StoryblokLabelLink, StoryblokProjectLayout } from '#types/component-types-sb.js';

import ProjectLayoutBase from '#storyblok/partials/project/layouts/ProjectLayoutBase.vue';

// Props :
const { blok } = defineProps<{
	blok: StoryblokProjectLayout;
	socials: StoryblokLabelLink[];
	pictures: StoryblokAsset[];
}>();

// Config :
const currentConfig = computed(() => PROJECT_LAYOUT_CONFIGS[blok.layout]);
</script>

<template>
	<section class="modules project-layout">
		<ProjectLayoutBase
			v-if="currentConfig"
			:blok="blok"
			:socials="socials"
			:layouts="currentConfig"
			:pictures="pictures"
		/>
	</section>
</template>

<style lang="scss" scoped>
.project-layout {
}
</style>
