<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import { computed } from 'vue';

import { nl2br } from '#utils/nl2br.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import Image from '#components/utils/Image.vue';
import LabelName from '#components/utils/LabelName.vue';

import type { StoryblokProject, StoryblokServiceProjectsExample } from '#types/component-types-sb.js';

import vParallax from '#directives/vParallax.ts';

// Props :
const { blok } = defineProps<{
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
	return blok.projects.filter((project): project is ISbStoryData<StoryblokProject> => {
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
				<p
					v-if="layout.hasDescription && blok.description"
					v-animate="'reveal-paragraphs'"
					v-html="nl2br(blok.description)"
				/>

				<Button
					v-if="projects[index]"
					v-animate="{ type: 'mask-reveal', options: { direction: 'down' } }"
					class="project-container"
					:to="projects[index].full_slug"
					:data-cursor-label="$t('discoverProject')"
					@click="trackNavigationClick"
				>
					<div class="picture-container">
						<div class="picture-wrapper">
							<picture>
								<Image
									v-if="projects[index].content.informations?.[0]?.cover"
									v-parallax="4"
									source
									media="tablet"
									object-fit="contain"
									:sizes="[{ desktop: '50vw' }, '80vw']"
									:src="projects[index].content.informations[0].cover"
								/>
								<Image
									v-if="projects[index].content.informations?.[0]?.coverMobile"
									v-parallax="4"
									unstyled
									layout="fullWidth"
									:sizes="[{ tablet: '768px' }, '100vw']"
									:src="projects[index].content.informations[0].coverMobile"
								/>
							</picture>
						</div>
					</div>
					<LabelName
						v-if="projects[index].content.informations?.[0]?.name"
						v-animate="{ type: 'reveal-button-dot', options: { start: 'top 110%' } }"
						:name="projects[index].content.informations[0].name"
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
			margin-block-start: fluidSize(56px, 48px, null, desktop);
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
	position: relative;

	@include hover {
		.picture-wrapper {
			transform: scale3d(1.025, 1.025, 1);
		}
	}
}

.picture-container {
	overflow: hidden;
}

.picture-wrapper {
	width: 100%;
	height: 100%;
	transition: transform 0.8s $power2Out;

	:deep(img) {
		@include img-fill;
	}
}
</style>
