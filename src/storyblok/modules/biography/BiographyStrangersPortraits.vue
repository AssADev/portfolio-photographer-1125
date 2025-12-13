<script setup lang="ts">
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computed, onMounted, onUnmounted, useTemplateRef } from 'vue';

import RichText from '#components/utils/RichText.vue';
import StoryblokComponent from '#components/utils/StoryblokComponent.vue';

import type { StoryblokBiographyStrangersPortraits, StoryblokLabelLink } from '#types/component-types-sb.js';

import BiographyStrangersPortraitsExplanation from '#storyblok/partials/biography/BiographyStrangersPortraitsExplanation.vue';
import BiographyStrangersPortraitsVideo from '#storyblok/partials/biography/BiographyStrangersPortraitsVideo.vue';

// Props :
const props = defineProps<{
	blok: StoryblokBiographyStrangersPortraits;
	socials: StoryblokLabelLink[];
}>();

// Components :
const SectionsComponents = {
	BiographyStrangersPortraitsExplanation,
	BiographyStrangersPortraitsVideo
};

// Refs :
let ctx: gsap.Context;

const elRef = useTemplateRef('elRef');
const sectionsWrapper = useTemplateRef('sectionsWrapperRef');

// Computed :
const explanationIndices = computed(() => {
	let count = 0;
	const indices: Record<string, number> = {};

	props.blok.sections?.forEach((section) => {
		if (section.component.toLowerCase().includes('explanation')) {
			indices[section._uid] = count++;
		}
	});

	return indices;
});

// Methods :
const getScrollAmount = () => {
	if (!sectionsWrapper.value || !elRef.value) return 0;
	const totalWidth = sectionsWrapper.value.scrollWidth;
	const containerWidth = elRef.value.offsetWidth;

	return Math.max(0, totalWidth - containerWidth);
};

// Attach & Detach :
onMounted(() => {
	if (elRef.value) {
		ctx = gsap.context(() => {
			if (elRef.value && sectionsWrapper.value) {
				gsap.to(sectionsWrapper.value, {
					x: () => -getScrollAmount(),
					ease: 'none',
					scrollTrigger: {
						trigger: elRef.value,
						pin: true,
						scrub: true,
						start: 'bottom bottom',
						end: () => `+=${getScrollAmount()}`,
						invalidateOnRefresh: true
					}
				});
			}
		}, elRef.value);
	}
});

onUnmounted(() => {
	ctx?.revert();
});
</script>

<template>
	<section ref="elRef" class="modules biography-strangers-portraits">
		<div class="container-grid">
			<RichText
				:doc="blok.title"
				class="col-start-1 col-end-13 col-start-tb-1 col-end-tb-15 col-start-dk-1 col-end-dk-23 col-start-xlg-1 col-end-xlg-21 col-start-xxlg-1 col-end-xxlg-19"
			/>
		</div>
		<div class="sections-container">
			<div ref="sectionsWrapperRef" class="sections-wrapper">
				<StoryblokComponent
					v-for="(section, index) in blok.sections"
					:key="section._uid"
					:components="SectionsComponents"
					:blok="section"
					:index="explanationIndices[section._uid] ?? index"
					:socials="socials"
				/>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.biography-strangers-portraits {
	position: relative;
	background: linear-gradient(180deg, $white 0%, $ivory 25%, $ivory 75%, $white 100%);
	padding-block: fluidSize(160px, 120px) fluidSize(120px, 80px);
}

.container-grid {
	:deep(.partials-rich-text) {
		@include roobert-96;

		z-index: 1;
		margin-block-end: fluidSize(65px, 45px);

		em {
			@include romie-96-italic;
		}
	}
}

.sections-container {
	position: relative;
	z-index: 1;
	width: 100%;
	max-width: 100%;
	overflow: hidden;
}

.sections-wrapper {
	display: flex;
	gap: 10px;
	padding-inline: var(--gutter);
	width: fit-content;
	height: fluidSize(620px, 520px);
}
</style>
