<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { useResizeObserver } from '@vueuse/core';
import gsap from 'gsap';
import { computed, useTemplateRef, watch } from 'vue';

import { animations } from '#utils/Animations.ts';

import MenuSocials from '#components/partials/MenuSocials.vue';

import { useAnimateHeight } from '#composables/useAnimateHeight.ts';
import { useTrap } from '#composables/useTrap.ts';
import { $global } from '#stores/global.ts';

// Props & Model :
const {
	theme = 'dark',
	hasError = false,
	preventClickOutside = false
} = defineProps<{
	theme?: 'dark' | 'light';
	hasError?: boolean;
	preventClickOutside?: boolean;
}>();

const globalStore = useStore($global);
const toggled = defineModel<boolean>('toggled', { default: false });

// Refs :
let tl: gsap.core.Timeline | null = null;

const drawerRef = useTemplateRef('drawerRef');
const containerRef = useTemplateRef('containerRef');
const titleContainerRef = useTemplateRef('titleContainerRef');
const socialsRef = useTemplateRef('socialsRef');

// Computed :
const clickOutsideEnabled = computed(() => !preventClickOutside && !globalStore.value.isHeaderAnimating);

// Composables :
const [innerEl, outerEl] = useAnimateHeight();

useTrap(containerRef, { model: toggled, clickOutsideDeactivates: clickOutsideEnabled, escapeDeactivates: true });

// Animations :
const openDrawer = () => {
	$global.setKey('lockScroll', true);

	// Animation :
	tl?.kill();
	tl = gsap.timeline();

	tl.to(
		drawerRef.value,
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
	toggled.value = false;
	$global.setKey('lockScroll', false);

	// Animation :
	tl?.kill();
	tl = gsap.timeline();

	tl.to(drawerRef.value, { clipPath: 'inset(100% 0 0 0)', duration: 0.6, ease: 'power2.inOut' });

	return tl;
};

// Watchers :
watch(toggled, (isToggled) => {
	if (!isToggled && tl?.progress() === 1) closeDrawer();
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

// Expose :
defineExpose({
	drawerRef,
	openDrawer,
	closeDrawer
});
</script>

<template>
	<div ref="drawerRef" class="drawer-menu">
		<div class="overlay" @click="!preventClickOutside && (toggled = false)" />
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
			<div class="drawer-footer">
				<slot name="footer" />
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
@use 'sass:map';

.drawer-menu {
	--width: 365px;
	--menu-padding-inline: 14px;

	position: fixed;
	bottom: var(--gutter);
	right: var(--gutter);
	z-index: 25;
	max-width: var(--width);
	width: calc(100% - var(--gutter) * 2);
	clip-path: inset(100% 0 0 0);
	// opacity: 0;
	// visibility: hidden;
}

.overlay {
	--deg: 180deg;

	position: absolute;
	bottom: calc(var(--gutter) * -1);
	right: calc(var(--gutter) * -1);
	width: 100vw;
	height: 100vh;
	background: linear-gradient(var(--deg), transparent, rgba($whiteChoco, 0.125));

	@include mq(tablet) {
		--deg: 125deg;
	}
}

.drawer-container {
	position: relative;
	width: 100%;
	height: fit-content;
	border-radius: var(--border-radius);
	overflow: hidden;

	&.dark {
		$border: 1px solid rgba($white, 0.08);

		color: $white;
		background: $eerieBlack;

		.drawer-title-container {
			border-bottom: $border;
		}

		:deep(.menu-socials-container) {
			border-top: $border;
		}

		.drawer-footer {
			border-top: $border;
		}
	}

	&.light {
		$border: 1px solid rgba($eerieBlack, 0.08);

		color: $eerieBlack;
		background: $whiteChoco;

		.drawer-title-container {
			border-bottom: $border;
		}

		:deep(.menu-socials-container) {
			border-top: $border;
		}

		.drawer-footer {
			border-top: $border;
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

.drawer-footer {
	display: flex;
	align-items: center;
	height: var(--header-height);
	padding-inline: var(--menu-padding-inline);
}
</style>
