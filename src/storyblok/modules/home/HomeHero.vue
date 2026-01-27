<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import type { ISbStoryData } from '@storyblok/js';
import { useResizeObserver } from '@vueuse/core';
import { computed, nextTick, onMounted, ref } from 'vue';

import { formatIndex } from '#utils/formatIndex.ts';

import Button from '#components/utils/Button.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokHomeHero, StoryblokProject, StoryblokService } from '#types/component-types-sb.js';

import { $currentFilter, setCurrentFilter } from '#stores/filter.ts';

// Props :
const { blok, projects } = defineProps<{
	blok: StoryblokHomeHero;
	projects: ISbStoryData<StoryblokProject>[];
}>();

// Refs :
const containerRef = ref<HTMLElement | null>(null);
const richTextRef = ref<InstanceType<typeof RichText> | null>(null);

// Store :
const currentFilter = useStore($currentFilter);

// Computed :
const services = computed(() => {
	return (blok.services?.filter((s) => typeof s !== 'string') as ISbStoryData<StoryblokService>[]) || [];
});

const visibleServices = computed(() => {
	return services.value.filter((service) => getProjectCount(service.slug) > 0);
});

// Methods :
const getProjectCount = (serviceSlug?: string) => {
	if (!serviceSlug) return projects.length;

	return projects.filter((p) => {
		const projectServices = p.content.informations?.[0]?.service;
		if (!projectServices) return false;

		return projectServices.some((s) => {
			if (typeof s === 'string') return s === serviceSlug;
			return s.slug === serviceSlug || s.uuid === serviceSlug;
		});
	}).length;
};

const updateFontSize = async () => {
	await nextTick();
	const container = containerRef.value;
	const textEl = richTextRef.value?.el as HTMLElement | undefined;

	if (container && textEl) {
		textEl.style.fontSize = '100px';
		textEl.style.display = 'inline-block';
		textEl.style.whiteSpace = 'nowrap';

		const containerWidth = container.clientWidth;
		const textWidth = textEl.offsetWidth;

		if (textWidth > 0) {
			const ratio = containerWidth / textWidth;
			const newSize = (100 * ratio).toFixed(2);

			textEl.style.fontSize = `${newSize}px`;
			textEl.style.display = 'block';
		}
	}
};

const handleFilterClick = (filter: string) => {
	setCurrentFilter(filter);
};

// Events :
useResizeObserver(containerRef, updateFontSize);

// Attach :
onMounted(() => {
	updateFontSize();
});
</script>

<template>
	<section class="modules home-hero">
		<div ref="containerRef" class="container">
			<div class="circular-star-wrapper">
				<CircularStar :scroll-speed="1" />
			</div>
			<div class="content-container">
				<RichText ref="richTextRef" :doc="blok.title" />
				<div class="filters-container">
					<Button
						:class="{ active: currentFilter === 'allMyProjects' }"
						@click="handleFilterClick('allMyProjects')"
					>
						<span>{{ $t('allMyProjects') }}</span>
						<span class="number">({{ formatIndex(getProjectCount()) }})</span>
					</Button>

					<Button
						v-for="service in visibleServices"
						:key="service.uuid"
						:class="{ active: currentFilter === service.slug }"
						@click="handleFilterClick(service.slug)"
					>
						<span><RichText :doc="service.content.informations?.[0]?.name" /></span>
						<span class="number">({{ formatIndex(getProjectCount(service.slug)) }})</span>
					</Button>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.modules.home-hero {
	@include pseudo-gradient('before', 'top', 'ivory-white-transparent', 1, fluidSize(640px, 420px));

	margin-block-end: fluidSize(96px, 60px, null, xxlarge);
}

.circular-star-wrapper {
	position: absolute;
	top: 0;
	left: 50%;
	transform: translate3d(-50%, 0, 0);
	overflow: hidden;
	pointer-events: none;

	:deep(.partials-circular-star) {
		@include mq($until: desktop) {
			@include svh(125, height);
		}

		@include mq($until: large) {
			transform: translate3d(0, -40%, 0);
		}

		@include mq(desktop) {
			width: var(--ctn-w);
		}

		@include mq(large) {
			transform: translate3d(0, -55%, 0);
		}

		@include mq(xlarge) {
			transform: translate3d(0, -60%, 0);
		}
	}
}

.content-container {
	position: relative;
	z-index: 1;

	& > :deep(.partials-rich-text) {
		@include roobert(400, none, -0.02em);

		line-height: 1;
		text-wrap: nowrap;
		white-space: nowrap;
		margin-block-end: fluidSize(40px, 24px);

		em {
			@include romie(500, none, -0.02em);

			font-style: italic;
		}

		p {
			margin: 0;
		}
	}
}

.filters-container {
	display: flex;
	gap: $gap;
	width: 100%;

	button {
		@include roobert-14-uppercase;

		display: flex;
		align-items: center;
		justify-content: center;
		gap: fluidSize(6px, 4px);
		width: 100%;
		height: 40px;
		background: $whiteChoco;
		border-radius: 4px;
		text-align: center;
		padding-inline: fluidSize(20px, 16px);
		transition:
			background 0.3s $power2Out,
			color 0.3s $power2Out;

		@include hover {
			background: $khaki;
		}

		&.active {
			background: $eerieBlack;
			color: $white;
			pointer-events: none;
		}

		.number {
			@include romie-12;

			padding-block-end: fluidSize(12px, 10px);
		}
	}
}
</style>
