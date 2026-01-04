<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { computed } from 'vue';

import { nl2br } from '#utils/nl2br.ts';

import Button from '#components/utils/Button.vue';
import Image from '#components/utils/Image.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokProject, StoryblokServiceProjectsExample } from '#types/component-types-sb.js';

import vParallax from '#directives/vParallax.ts';

// Props :
const props = defineProps<{
	blok: StoryblokServiceProjectsExample;
}>();

// Config :
const PROJECT_LAYOUTS = [
	{
		classes: 'col-start-1 col-end-9 col-start-tb-1 col-end-tb-12 col-start-dk-1 col-end-dk-17',
		parallax: { scale: false, mobile: -10, tablet: -8, desktop: 4 },
		hasDescription: false
	},
	{
		classes: 'col-start-4 col-end-13 col-start-tb-6 col-end-tb-17 col-start-dk-17 col-end-dk-33',
		parallax: { scale: false, mobile: -12, tablet: -12, desktop: -2 },
		hasDescription: true
	}
] as const;

// Computed :
const projects = computed(() => {
	return props.blok.projects.filter((project): project is ISbStoryData<StoryblokProject> => {
		return typeof project !== 'string';
	});
});
</script>

<template>
	<section class="modules service-projects-example">
		<div class="container-grid">
			<div
				v-for="(layout, index) in PROJECT_LAYOUTS"
				:key="index"
				class="section-container"
				:class="layout.classes"
				v-parallax="layout.parallax"
			>
				<p v-if="layout.hasDescription && blok.description" v-html="nl2br(blok.description)" />

				<Button
					v-if="projects[index]"
					class="project-container"
					:to="projects[index].full_slug"
					:data-cursor-label="$t('discoverProject')"
				>
					<div class="picture-container">
						<div class="picture-wrapper">
							<Image
								v-if="projects[index].content.informations?.[0]?.cover"
								v-parallax="4"
								object-fit="contain"
								:sizes="[{ desktop: '50vw' }, '80vw']"
								:src="projects[index].content.informations[0].cover"
							/>
						</div>
					</div>
					<RichText
						v-if="projects[index].content.informations?.[0]?.name"
						:doc="projects[index].content.informations[0].name"
					/>
				</Button>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.service-projects-example {
	padding-block: fluidSize(112px, 72px) fluidSize(96px, 60px);

	@include mq(desktop) {
		min-height: 100vh;
	}
}

.section-container {
	display: flex;
	flex-direction: column;
	gap: fluidSize(16px, 12px);

	&:last-child {
		@include mq($until: desktop) {
			margin-block-start: fluidSize(24px, 18px, null, desktop);
		}

		@include mq(desktop) {
			margin-block-start: fluidSize(128px, 96px, null, widescreen);
		}
	}

	& > p {
		@include roobert-18;

		max-width: fluidSize(420px, 360px, null, desktop);
	}
}

.project-container {
	@include hover {
		.picture-wrapper {
			transform: scale3d(1.025, 1.025, 1);
		}
	}

	& > :deep(.partials-rich-text) {
		@include roobert-28;

		margin-block-start: fluidSize(8px, 6px);

		em {
			@include romie-28-italic;
		}
	}
}

.picture-container {
	overflow: hidden;
}

.picture-wrapper {
	width: 100%;
	height: 100%;
	transition: transform 0.6s $elasticOut;

	:deep(img) {
		@include img-fill;
	}
}
</style>
