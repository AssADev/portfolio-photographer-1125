<script setup lang="ts">
import { computed } from 'vue';

import { PROJECT_LAYOUT_CONFIGS } from '#utils/projectLayouts.ts';

import type { StoryblokLabelLink, StoryblokProjectLayout } from '#types/component-types-sb.js';

import ProjectLayoutBase from '#storyblok/partials/project/layouts/ProjectLayoutBase.vue';

// Props :
const props = defineProps<{
	blok: StoryblokProjectLayout;
	socials: StoryblokLabelLink[];
}>();

// Config :
const currentConfig = computed(() => {
	const layout = props.blok.layout;
	return layout ? PROJECT_LAYOUT_CONFIGS[layout] : null;
});
</script>

<template>
	<section class="modules project-layout">
		<ProjectLayoutBase
			v-if="currentConfig"
			:blok="blok"
			:socials="socials"
			:layouts="currentConfig"
			:layout-name="blok.layout"
		/>
	</section>
</template>

<style lang="scss" scoped>
.project-layout {
}
</style>
