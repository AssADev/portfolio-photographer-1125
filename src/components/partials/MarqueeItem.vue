<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { computed } from 'vue';

import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject } from '#types/component-types-sb.js';

// Props :
const { project } = defineProps<{ project: ISbStoryData<StoryblokProject> }>();

// Variables :
const informations = computed(() => project.content.informations?.[0]);
</script>

<template>
	<a v-if="informations" :href="project.full_slug" class="partials-marquee-item">
		<RichText :doc="informations.name" />
		<Image :src="informations.cover" />
	</a>
</template>

<style lang="scss" scoped>
.partials-marquee-item {
	display: block;
	width: 200px;
	height: 200px;
	overflow: hidden;
}
</style>
