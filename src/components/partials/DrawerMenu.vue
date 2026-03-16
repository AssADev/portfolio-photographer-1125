<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import gsap from 'gsap';
import { onUnmounted, useTemplateRef, watch } from 'vue';

import { animations } from '#utils/Animations.ts';

import MenuSocials from '#components/partials/MenuSocials.vue';

import { useAnimateHeight } from '#composables/useAnimateHeight.ts';
import { $global } from '#stores/global.ts';

// Props & Model :
const { theme = 'dark', hasError = false } = defineProps<{
	theme?: 'dark' | 'light';
	hasError?: boolean;
}>();

const toggled = defineModel<boolean>('toggled', { default: false });

// Refs :
let tl: gsap.core.Timeline | null = null;

const drawerRef = useTemplateRef('drawerRef');
const containerRef = useTemplateRef('containerRef');
const titleContainerRef = useTemplateRef('titleContainerRef');
const socialsRef = useTemplateRef('socialsRef');

// Composables :
const [innerEl, outerEl] = useAnimateHeight();

// Animations :
const openDrawer = () => {
	$global.setKey('lockScroll', true);

	drawerRef.value!.style.display = 'block';

	// Animation :
	tl?.kill();
	tl = gsap.timeline({
		onStart: () => {
			drawerRef.value!.classList.add('is-open');
		}
	});

	tl.to(
		containerRef.value,
		{
			clipPath: 'inset(0% 0 0 0)',
			duration: 0.8,
			ease: 'power2.inOut'
		},
		0
	);

	const socialsLinks = socialsRef.value?.$el.querySelectorAll('a span');
	socialsLinks.forEach((link: any, index: number) => {
		const reverseIndex = socialsLinks.length - 1 - index;

		tl!.add(animations['reveal-letters-speed'](link, { delay: 0.25 + reverseIndex * 0.125 }), 0);
	});

	return tl;
};

const closeDrawer = () => {
	if (!toggled.value && tl?.vars?.isClosing) return tl;

	toggled.value = false;
	$global.setKey('lockScroll', false);
	drawerRef.value!.classList.remove('is-open');

	// Animation :
	tl?.kill();
	tl = gsap.timeline({
		isClosing: true,
		onComplete: () => {
			drawerRef.value!.style.display = 'none';
		}
	});

	tl.to(containerRef.value, { clipPath: 'inset(100% 0 0 0)', duration: 0.6, ease: 'power2.inOut' });

	return tl;
};

// Watchers :
watch(toggled, (isToggled) => {
	if (!isToggled && tl && tl.progress() > 0 && !tl.vars.isClosing) closeDrawer();
});

// Resize observers :
useResizeObserver(titleContainerRef, () => {
	const titleHeight = titleContainerRef.value?.offsetHeight || 0;
	drawerRef.value!.style.setProperty('--drawer-title-height', `${titleHeight}px`);
});

useResizeObserver(socialsRef, () => {
	const socialsHeight = socialsRef.value?.$el?.offsetHeight || 0;
	drawerRef.value!.style.setProperty('--drawer-socials-height', `${socialsHeight}px`);
});

// Detach :
onUnmounted(() => {
	tl?.kill();
	$global.setKey('lockScroll', false);
});

// Expose :
defineExpose({
	drawerRef,
	containerRef,
	openDrawer,
	closeDrawer
});
</script>

<template>
	<div ref="drawerRef" class="drawer-menu">
		<div class="overlay" @click="toggled = false" />
		<div ref="containerRef" class="drawer-container" :class="theme">
			<div ref="outerEl" class="drawer-body" :class="{ 'form-error': hasError }">
				<div ref="innerEl" class="drawer-inner-body">
					<div v-if="$slots.title" ref="titleContainerRef" class="drawer-title-container">
						<slot name="title" />
					</div>
					<div class="drawer-content-container" data-lenis-prevent>
						<slot />
					</div>
				</div>
			</div>
			<MenuSocials ref="socialsRef" />
		</div>
	</div>
</template>

<style scoped lang="scss">
@use 'sass:map';

.drawer-menu {
	--menu-padding-inline: 14px;

	position: fixed;
	inset: 0;
	z-index: -1;
	display: none;
	pointer-events: none;

	&.is-open {
		pointer-events: auto;
	}
}

.overlay {
	position: absolute;
	inset: 0;
}

.drawer-container {
	position: absolute;
	z-index: 2;
	bottom: var(--gutter);
	right: var(--gutter);
	width: 100%;
	height: fit-content;
	border-radius: var(--border-radius);
	overflow: hidden;
	clip-path: inset(100% 0 0 0);

	@include mq($until: tablet) {
		max-width: calc(100vw - var(--gutter) * 2);
	}

	@include mq(tablet) {
		max-width: var(--drawer-max-width);
	}

	&.dark {
		$border: 1px solid rgba($white, 0.08);

		color: $white;
		background: $eerieBlack;

		:deep(.menu-socials-container) {
			border-top: $border;
			border-bottom: $border;
		}
	}

	&.light {
		$border: 1px solid rgba($eerieBlack, 0.08);

		color: $eerieBlack;
		background: $whiteChoco;

		:deep(.menu-socials-container) {
			border-top: $border;
			border-bottom: $border;
		}
	}
}

.drawer-title-container {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 20px var(--menu-padding-inline) 16px;

	:deep(.title) {
		@include roobert-20-uppercase;
	}

	:deep(.description) {
		@include roobert-14;

		opacity: 0.5;
	}
}

.drawer-body {
	position: relative;
	overflow: hidden;
	transition: height 0.4s $power2Out;

	&.form-error {
		&::before {
			opacity: 1;
			transform: translate3d(0, 0, 0);
			transition:
				opacity 0.4s $power2Out,
				transform 0.4s $power2Out;
		}
	}

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		opacity: 0;
		background: map.get($gradients, 'form-error-drawer-body');
		transition:
			opacity 0.4s $power2Out,
			transform 0.4s $power2Out 0.3s;
		transform: translate3d(0, -50%, 0);
		pointer-events: none;
	}

	.drawer-inner-body {
		position: relative;
		max-height: calc(100svh - var(--header-height) - var(--drawer-socials-height) - var(--gutter) * 2);
	}

	.drawer-content-container {
		@include hide-scrollbar;

		max-height: calc(
			100svh - var(--header-height) - var(--drawer-socials-height) - var(--drawer-title-height) - var(--gutter) *
				2
		);
		overflow-y: auto;
	}
}
</style>
