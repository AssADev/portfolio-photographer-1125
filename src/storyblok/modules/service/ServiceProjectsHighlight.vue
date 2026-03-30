<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/js';
import emblaCarouselVue from 'embla-carousel-vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

import { trackNavigationClick } from '#utils/tracking.ts';

import Image from '#components/utils/Image.vue';
import LabelName from '#components/utils/LabelName.vue';

import type { StoryblokProject, StoryblokServiceProjectsHighlight } from '#types/component-types-sb.js';

import vParallax from '#directives/vParallax.ts';

// Props :
const { blok } = defineProps<{
	blok: StoryblokServiceProjectsHighlight;
}>();

// Refs :
const sectionRef = useTemplateRef('sectionRef');

const isVisible = ref(false);
const currentSlide = ref(0);
const isGrabbing = ref(false);
const progressBars = ref<HTMLElement[]>([]);
const currentAnim = ref<gsap.core.Tween | null>(null);

let st: ScrollTrigger | null = null;

const [emblaRef, emblaApi] = emblaCarouselVue({
	active: (blok.projects?.length ?? 0) > 1 ? true : false,
	loop: true
});

// Variables :
const autoplayDelay = 8;

// Computed :
const projects = computed(() => {
	return blok.projects.filter((project): project is ISbStoryData<StoryblokProject> => {
		return typeof project !== 'string';
	});
});

// Methods :
const killAutoplay = () => {
	if (currentAnim.value) {
		currentAnim.value.kill();
		currentAnim.value = null;
	}
};

const startAutoplay = (index: number) => {
	killAutoplay();
	if (isGrabbing.value) return;

	const bar = progressBars.value[index];
	if (!bar) return;

	bar.classList.add('active');
	gsap.set(bar, { '--progress-scale': 0 });

	currentAnim.value = gsap.to(bar, {
		'--progress-scale': 1,
		duration: autoplayDelay,
		ease: 'none',
		paused: !isVisible.value,
		onComplete: () => {
			if (emblaApi.value) emblaApi.value.scrollNext();
		}
	});
};

const updateCurrentSlide = () => {
	if (!emblaApi.value) return;

	const currentIndex = emblaApi.value.selectedScrollSnap();
	const previousIndex = emblaApi.value.previousScrollSnap();

	if (previousIndex !== currentIndex) {
		killAutoplay();

		const prevBar = progressBars.value[previousIndex];
		if (prevBar) {
			gsap.killTweensOf(prevBar);

			const tl = gsap.timeline();

			// If the progress is already at 1, skip the animation :
			if (prevBar.style.getPropertyValue('--progress-scale') !== '1') {
				tl.to(prevBar, {
					'--progress-scale': 1,
					duration: 0.6,
					ease: 'power2.out'
				});
			}
			tl.call(() => {
				prevBar.classList.remove('active');
			});
			tl.to(prevBar, {
				'--progress-scale': 0,
				duration: 0.6,
				ease: 'power2.inOut'
			});
		}
	}

	currentSlide.value = currentIndex;

	if (isGrabbing.value) {
		const currentBar = progressBars.value[currentIndex];
		if (currentBar) {
			currentBar.classList.add('active');
			gsap.set(currentBar, { '--progress-scale': 0 });
		}
	} else {
		startAutoplay(currentIndex);
	}
};

const onPointerDown = () => {
	isGrabbing.value = true;
	if (currentAnim.value) currentAnim.value.pause();
};

const onPointerUp = () => {
	isGrabbing.value = false;
	if (currentAnim.value) {
		if (isVisible.value) currentAnim.value.play();
	} else if (emblaApi.value) {
		startAutoplay(emblaApi.value.selectedScrollSnap());
	}
};

const goToSlide = (index: number) => {
	if (!emblaApi.value || index === emblaApi.value.selectedScrollSnap()) return;
	emblaApi.value.scrollTo(index);
};

// Attach & Detach :
onMounted(() => {
	if (!emblaApi.value || (projects.value?.length ?? 0) <= 1) return;

	// Events :
	emblaApi.value.on('select', updateCurrentSlide);
	emblaApi.value.on('reInit', updateCurrentSlide);
	emblaApi.value.on('pointerDown', onPointerDown);
	emblaApi.value.on('pointerUp', onPointerUp);

	// Init :
	st = ScrollTrigger.create({
		trigger: sectionRef.value,
		onToggle: (self) => {
			isVisible.value = self.isActive;
			if (self.isActive) {
				if (currentAnim.value) {
					currentAnim.value.play();
				} else if (emblaApi.value) {
					startAutoplay(emblaApi.value.selectedScrollSnap());
				}
			} else {
				currentAnim.value?.pause();
			}
		}
	});
});

onUnmounted(() => {
	killAutoplay();
	st?.kill();
});
</script>

<template>
	<section class="modules service-projects-highlight" ref="sectionRef">
		<div
			v-animate="{ type: 'mask-reveal', options: { direction: 'up' } }"
			class="slideshow-container"
			ref="emblaRef"
		>
			<div
				class="slideshow-wrapper"
				:class="{
					'can-grab': emblaApi && (projects?.length ?? 0) > 1,
					'is-grabbing': isGrabbing
				}"
			>
				<a
					v-for="(project, index) in projects"
					:key="index"
					:href="project.full_slug"
					class="project-slide"
					:data-cursor-label="$t('discoverProject')"
					@click="trackNavigationClick"
				>
					<div class="picture-wrapper">
						<picture v-parallax="{ desktop: 12, tablet: 10, mobile: 8 }">
							<Image
								source
								media="tablet"
								layout="fullWidth"
								:aspect-ratio="1440 / 720"
								:sizes="[{ widescreen: '2560px' }, '100vw']"
								:src="project.content.informations![0].cover"
							/>
							<Image
								unstyled
								layout="fullWidth"
								:aspect-ratio="375 / 720"
								:sizes="[{ tablet: '768px' }, '100vw']"
								:src="project.content.informations![0].coverMobile"
							/>
						</picture>
					</div>
					<LabelName
						v-if="project.content.informations?.[0]?.name"
						v-animate="{ type: 'reveal-button-dot', options: { start: 'top 110%' } }"
						:name="project.content.informations[0].name"
					/>
				</a>
			</div>
			<div v-if="projects.length > 1" class="slideshow-navigation">
				<button
					v-for="(project, index) in projects"
					:key="index"
					:ref="(el) => (progressBars[index] = el as HTMLElement)"
					class="progress-bar"
					@click="goToSlide(index)"
					:disabled="currentSlide === index"
					:aria-disabled="currentSlide === index"
					:aria-label="$t('goToSlide', { n: index + 1 })"
				/>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.service-projects-highlight {
	z-index: 1;
	height: var(--full-height-without-header);
	overflow: hidden;
}

.slideshow-container {
	position: relative;
	height: 100%;
}

.slideshow-wrapper {
	display: flex;
	height: 100%;
	cursor: pointer;

	&.can-grab {
		cursor: grab;

		.project-slide {
			&::before {
				content: '';
				position: absolute;
				z-index: 1;
				bottom: 0;
				left: 0;
				width: 100%;
				height: fluidSize(125px, 100px);
				background: linear-gradient(180deg, rgba($black, 0), rgba($black, 0.4));
			}

			& > :deep(.partials-label-name) {
				bottom: calc(var(--gutter) * 2);
			}
		}
	}

	&.is-grabbing {
		cursor: grabbing;
	}
}

.project-slide {
	position: relative;
	min-width: 0;
	flex: 0 0 100%;
	overflow: hidden;
	cursor: inherit;

	@include hover {
		.picture-wrapper {
			transform: scale3d(1.025, 1.025, 1);
		}
	}
}

.picture-wrapper {
	position: absolute;
	inset: 0;
	transition: transform 0.8s $power2Out;

	picture {
		display: block;
		width: 100%;
		height: 100%;
	}

	:deep(img) {
		@include img-fill;
	}
}

.slideshow-navigation {
	position: absolute;
	bottom: var(--gutter);
	left: var(--gutter);
	display: flex;
	align-items: center;
	gap: $gap;
	width: calc(100% - (var(--gutter) * 2));
}

.progress-bar {
	@include a11y-focus(-10px);

	position: relative;
	width: 100%;
	height: 2px;
	background: rgba($white, 0.4);
	transition: background 0.4s $power2Out;

	@include hover {
		background: rgba($whiteChoco, 0.65);
	}

	&::after {
		content: '';
		position: absolute;
		inset: 0;
		background: $white;
		transform-origin: right center;
		transform: scale3d(var(--progress-scale, 0), 1, 1);
	}

	&.active {
		&::after {
			transform-origin: left center;
		}
	}
}
</style>
