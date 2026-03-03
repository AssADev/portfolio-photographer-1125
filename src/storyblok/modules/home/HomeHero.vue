<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import type { ISbStoryData } from '@storyblok/js';
import { useResizeObserver, useWindowScroll } from '@vueuse/core';
import gsap from 'gsap';
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

import { formatIndex } from '#utils/formatIndex.ts';
import { getRichTextResolvers } from '#utils/getRichTextResolvers.ts';
import { t } from '#utils/i18n.ts';

import IconPlusMinus from '#components/partials/IconPlusMinus.vue';
import LabelShuffle from '#components/partials/LabelShuffle.vue';
import Button from '#components/utils/Button.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokHomeHero, StoryblokProject, StoryblokService } from '#types/component-types-sb.js';

import { useTrap } from '#composables/useTrap.ts';
import { $currentFilter, setCurrentFilter } from '#stores/filter.ts';
import { $global } from '#stores/global.ts';

// Props :
const { blok, projects } = defineProps<{
	blok: StoryblokHomeHero;
	projects: ISbStoryData<StoryblokProject>[];
}>();

// Refs :
const containerRef = useTemplateRef('containerRef');
const dropdownRef = useTemplateRef('dropdownRef');
const filtersContainerRef = useTemplateRef('filtersContainerRef');
const titleRef = useTemplateRef('titleRef');

// Store :
const currentFilter = useStore($currentFilter);

// Animation & Sync :
let charIdCounter = 0;
let isManualClickOnOpenDropdown = false;
let pendingSwap: { newSlug: string; oldSlug: string } | null = null;

const isDropdownToggle = ref(false);

const labelChars = ref<{ char: string; id: number }[]>([]);
const countChars = ref<{ char: string; id: number }[]>([]);
const mobileFilters = ref<{ slug: string; name: string; count: number }[]>([]);

const mobileLabelRef = useTemplateRef('mobileLabelRef');
const mobileCountRef = useTemplateRef('mobileCountRef');

// Composables :
const { y } = useWindowScroll();

useTrap(filtersContainerRef, {
	model: isDropdownToggle,
	clickOutsideDeactivates: true,
	escapeDeactivates: true
});

// Computed :
const services = computed(() => {
	return (blok.services?.filter((s) => typeof s !== 'string') as ISbStoryData<StoryblokService>[]) || [];
});

const visibleServices = computed(() => {
	return services.value.filter((service) => getProjectCount(service.slug) > 0);
});

const allFilters = computed(() => {
	const all = [
		{
			slug: 'allMyProjects',
			name: t('allMyProjects'),
			count: getProjectCount()
		},
		...visibleServices.value.map((s) => ({
			slug: s.slug,
			name: extractPlainText(s.content.informations?.[0]?.name),
			count: getProjectCount(s.slug)
		}))
	];
	return all;
});

// Helper :
const stringToChars = (s: string) => s.split('').map((c) => ({ char: c, id: charIdCounter++ }));

const extractPlainText = (doc: any): string => {
	if (!doc) return '';
	if (typeof doc === 'string') return doc;

	const walk = (node: any): string => {
		if (node.text) return node.text;
		if (node.content && Array.isArray(node.content)) {
			return node.content.map(walk).join('');
		}
		return '';
	};

	return walk(doc);
};

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

const exitMaskedChars = async (charsRef: typeof labelChars, containerRef: typeof mobileLabelRef) => {
	const exitChars = charsRef.value;

	if (exitChars.length > 0 && containerRef.value) {
		const exitEls = exitChars
			.map((item) => containerRef.value!.querySelector(`[data-char-id="${item.id}"]`))
			.filter(Boolean);

		await gsap.to(exitEls, {
			x: '105%',
			duration: 0.25,
			stagger: -0.02,
			ease: 'power2.in'
		});
	}

	charsRef.value = [];
};

const enterMaskedChars = async (newText: string, charsRef: typeof labelChars, containerRef: typeof mobileLabelRef) => {
	if (charsRef.value.length > 0) return;

	const newSuffix = newText;
	if (newSuffix.length > 0) {
		const newItems = newSuffix.split('').map((char) => ({ char, id: charIdCounter++ }));
		charsRef.value.push(...newItems);

		await nextTick();

		if (containerRef.value) {
			const newEls = newItems
				.map((item) => containerRef.value!.querySelector(`[data-char-id="${item.id}"]`))
				.filter(Boolean);

			gsap.set(newEls, { x: '105%' });
			await gsap.to(newEls, {
				x: '0%',
				duration: 0.3,
				stagger: 0.02,
				ease: 'power2.out'
			});
		}
	}
};

const updateFontSize = async () => {
	await nextTick();
	const container = containerRef.value;
	const textEl = titleRef.value?.el as HTMLElement | undefined;

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

const handleFilterClick = (filterSlug: string) => {
	if (filterSlug === currentFilter.value) return;

	// Capture if dropdown was open before any state change :
	const wasOpen = isDropdownToggle.value;

	if (wasOpen) {
		isManualClickOnOpenDropdown = true;
		handleToggleDropdown();
	}

	setCurrentFilter(filterSlug);
};

const handleToggleDropdown = () => {
	isDropdownToggle.value = !isDropdownToggle.value;
	$global.setKey('lockScroll', isDropdownToggle.value);
};

// Events :
useResizeObserver(containerRef, updateFontSize);

watch(
	() => currentFilter.value,
	async (newSlug, oldSlug) => {
		const newFilter = allFilters.value.find((f) => f.slug === newSlug);
		const oldFilter = allFilters.value.find((f) => f.slug === oldSlug);

		if (newFilter && oldFilter) {
			// Handle swap detection immediately :
			if (isManualClickOnOpenDropdown) {
				pendingSwap = { newSlug, oldSlug };
				isManualClickOnOpenDropdown = false;
			}

			const newCountText = `(${formatIndex(newFilter.count)})`;

			// 1. Exit Logic : Count then Label (slightly overlapping) :
			await Promise.all([
				exitMaskedChars(countChars, mobileCountRef),
				new Promise((resolve) => setTimeout(resolve, countChars.value.length * 20)).then(() =>
					exitMaskedChars(labelChars, mobileLabelRef)
				)
			]);

			// 2. Enter Logic : Label then Count (slightly overlapping) :
			await Promise.all([
				enterMaskedChars(newFilter.name, labelChars, mobileLabelRef),
				new Promise((resolve) => setTimeout(resolve, labelChars.value.length * 20)).then(() =>
					enterMaskedChars(newCountText, countChars, mobileCountRef)
				)
			]);

			// If not a manual click (e.g. desktop change), swap immediately :
			if (!pendingSwap) {
				performMobileFilterSwap(newSlug, oldSlug);
			}
		}
	}
);

const performMobileFilterSwap = (newSlug: string, oldSlug: string) => {
	const oldFilter = allFilters.value.find((f) => f.slug === oldSlug);
	if (!oldFilter) return;

	const index = mobileFilters.value.findIndex((f) => f.slug === newSlug);
	if (index !== -1) {
		mobileFilters.value[index] = oldFilter;
	}
};

const onDropdownTransitionEnd = (e: TransitionEvent) => {
	if (e.propertyName === 'grid-template-rows') {
		if (!isDropdownToggle.value && pendingSwap) {
			performMobileFilterSwap(pendingSwap.newSlug, pendingSwap.oldSlug);
			pendingSwap = null;
		}
	}
};

// Watchers :
watch(isDropdownToggle, (val) => {
	if (!val && pendingSwap) {
		// Ensure any pending swap is done if closed via click-outside/escape :
		performMobileFilterSwap(pendingSwap.newSlug, pendingSwap.oldSlug);
		pendingSwap = null;
	}
});

// Resolvers (RichText) :
const resolvers = getRichTextResolvers('h1');

// Attach :
onMounted(() => {
	updateFontSize();

	// Init (Mobile filters) :
	const current = allFilters.value.find((f) => f.slug === currentFilter.value) || allFilters.value[0];
	labelChars.value = stringToChars(current.name);
	countChars.value = stringToChars(`(${formatIndex(current.count)})`);
	mobileFilters.value = allFilters.value.filter((f) => f.slug !== current.slug);

	// Events :
	dropdownRef.value?.addEventListener('transitionend', onDropdownTransitionEnd);
});

onUnmounted(() => {
	dropdownRef.value?.removeEventListener('transitionend', onDropdownTransitionEnd);
});
</script>

<template>
	<section class="modules home-hero">
		<div ref="containerRef" class="container">
			<div class="content-container" :class="{ 'is-scrolled': y > 40 }">
				<RichText ref="titleRef" :doc="blok.title" :resolvers="resolvers" />
				<div
					ref="filtersContainerRef"
					class="filters-container hide-desktop"
					:class="{ toggle: isDropdownToggle }"
				>
					<Button @click="handleToggleDropdown">
						<div class="inner-cta">
							<span ref="mobileLabelRef" class="mobile-label">
								<span v-for="char in labelChars" :key="char.id" class="char-wrapper">
									<span class="char" :data-char-id="char.id">{{
										char.char === ' ' ? '\u00A0' : char.char
									}}</span>
								</span>
							</span>
							<span ref="mobileCountRef" class="number mobile-number">
								<span v-for="char in countChars" :key="char.id" class="char-wrapper">
									<span class="char" :data-char-id="char.id">{{ char.char }}</span>
								</span>
							</span>
						</div>
						<IconPlusMinus :active="isDropdownToggle" />
					</Button>

					<div ref="dropdownRef" class="dropdown-container" :class="{ toggle: isDropdownToggle }">
						<div class="dropdown-inner-container">
							<div class="dropdown-inner-wrapper">
								<Button
									v-for="filter in mobileFilters"
									:key="filter.slug"
									@click="handleFilterClick(filter.slug)"
								>
									<div class="inner-cta">
										<span>{{ filter.name }}</span>
										<span class="number">({{ formatIndex(filter.count) }})</span>
									</div>
								</Button>
							</div>
						</div>
					</div>
				</div>
				<div class="filters-container hide-mobile-tablet">
					<Button
						:class="{ active: currentFilter === 'allMyProjects' }"
						@click="handleFilterClick('allMyProjects')"
					>
						<div class="inner-cta">
							<LabelShuffle :label="$t('allMyProjects')" no-snap />
							<span class="number">({{ formatIndex(getProjectCount()) }})</span>
						</div>
					</Button>

					<Button
						v-for="service in visibleServices"
						:key="service.uuid"
						:class="{ active: currentFilter === service.slug }"
						@click="handleFilterClick(service.slug)"
					>
						<div class="inner-cta">
							<span><RichText :doc="service.content.informations?.[0]?.name" shuffle no-snap /></span>
							<span class="number">({{ formatIndex(getProjectCount(service.slug)) }})</span>
						</div>
					</Button>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.modules.home-hero {
	position: sticky;
	z-index: 2;
	top: 0;
	margin-block-end: fluidSize(128px, 56px, null, widescreen);
}

.content-container {
	position: relative;
	z-index: 1;
	transition: transform 0.8s $power2Out;

	&.is-scrolled {
		transform: translate3d(0, calc(-100% + 40px + var(--gutter)), 0);

		& > :deep(.partials-rich-text) {
			transform: translate3d(0, -20px, 0);
			transition: transform 2.4s $power2Out;
		}
	}

	& > :deep(.partials-rich-text) {
		@include roobert(400, none, -0.02em);

		line-height: 1;
		text-wrap: nowrap;
		white-space: nowrap;
		transition: transform 0.6s $power2Out;

		@include mq($until: desktop) {
			margin-block-end: fluidSize(48px, 24px, null, desktop);
		}

		@include mq(desktop) {
			white-space: nowrap;
			display: inline-block;
			margin-block-end: fluidSize(60px, 42px, null, widescreen);

			h1 {
				display: inline;
			}
		}

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
	position: relative;
	display: flex;
	width: 100%;

	@include mq($until: desktop) {
		border-radius: 4px;

		& > button {
			border-radius: 4px;
		}

		&.toggle {
			& > button {
				border-radius: 4px 4px 0 0;
				transition:
					background 0.3s $power2Out,
					color 0.3s $power2Out,
					border-radius 0.1s $power2Out;
			}
		}
	}

	@include mq(desktop) {
		gap: $gap;
	}

	button {
		@include roobert-14-uppercase;

		display: flex;
		align-items: center;
		justify-content: center;
		gap: fluidSize(6px, 4px);
		width: 100%;
		height: 40px;
		text-align: center;
		padding-inline: fluidSize(20px, 16px);
		transition:
			background 0.3s $power2Out,
			color 0.3s $power2Out,
			border-radius 0.1s $power2Out 0.5s;

		@include mq($until: desktop) {
			color: $white;
			background: $eerieBlack;

			@include hover {
				background: $smokyBlack;
			}

			&.active {
				background: $eerieBlack;
				color: $white;
				pointer-events: none;
			}
		}

		@include mq(desktop) {
			border-radius: 4px;
			background: $whiteChoco;

			@include hover {
				background: $khaki;
			}

			&.active {
				background: $eerieBlack;
				color: $white;
				pointer-events: none;
			}
		}

		&.active {
			pointer-events: none;
		}

		.inner-cta {
			position: relative;
		}

		:deep(.partials-icon-plus-minus) {
			position: absolute;
			top: 50%;
			right: 12px;
			transform: translate3d(0, -50%, 0);
		}

		.number {
			@include romie-12;

			position: absolute;
			top: 0;
			right: 0;
			transform: translate3d(calc(100% + fluidSize(4px, 3px)), calc(fluidSize(6px, 5px) * -1), 0);
		}

		.mobile-label,
		.mobile-number {
			display: inline-flex;
		}

		.char-wrapper {
			display: inline-flex;
			overflow: hidden;
			vertical-align: bottom;
		}

		.char {
			display: inline-block;
			will-change: transform;
		}
	}
}

.dropdown-container {
	position: absolute;
	z-index: 1;
	top: 100%;
	left: 0;
	width: 100%;
	display: grid;
	grid-template-rows: 0fr;
	transition: grid-template-rows 0.6s $power2InOut;
	overflow: hidden;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;

	&.toggle {
		grid-template-rows: 1fr;
		transition: grid-template-rows 0.6s $power2Out;
	}
}

.dropdown-inner-container {
	min-height: 0;
}

.dropdown-inner-wrapper {
	& > button {
		border-top: 1px solid rgba($white, 0.1);
	}
}
</style>
