<script setup lang="ts">
import { useVModel } from '@nanostores/vue';
import { useResizeObserver } from '@vueuse/core';
import gsap from 'gsap';
import { onMounted, ref, useTemplateRef, watch } from 'vue';

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

const toggled = defineModel<boolean>('toggled', { default: false });

// Emits :
const emit = defineEmits<{
	(e: 'close'): void;
}>();

// Refs :
let tl: gsap.core.Timeline | null = null;

const clickOutsideEnabled = ref(!preventClickOutside);

const drawerRef = useTemplateRef('drawerRef');
const titleContainerRef = useTemplateRef('titleContainerRef');
const socialsRef = useTemplateRef('socialsRef');

// Composables :
const [innerEl, outerEl] = useAnimateHeight();
const lockScroll = useVModel($global, 'lockScroll');

useTrap(drawerRef, { model: toggled, clickOutsideDeactivates: clickOutsideEnabled, escapeDeactivates: true });

// Animations :
const openDrawer = () => {
	lockScroll.value = true;
	tl?.kill();
	tl = gsap.timeline();

	gsap.set(drawerRef.value, { visibility: 'visible' });

	tl.to(drawerRef.value, {
		autoAlpha: 1,
		y: 0,
		duration: 0.6,
		ease: 'expo.out'
	});
};

const closeDrawer = () => {
	emit('close');
	toggled.value = false;
	lockScroll.value = false;

	tl?.kill();
	tl = gsap.timeline();

	tl.to(drawerRef.value, {
		autoAlpha: 0,
		y: 20,
		duration: 0.4,
		ease: 'power2.out'
	});
};

// Lifecycle :
onMounted(() => {
	gsap.set(drawerRef.value, { autoAlpha: 0, y: 20 });
});

// Watchers :
watch(
	() => preventClickOutside,
	(newValue) => {
		clickOutsideEnabled.value = !newValue;
	}
);

watch(toggled, (isToggled) => {
	isToggled ? openDrawer() : closeDrawer();
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
</script>

<template>
	<div ref="drawerRef" class="drawer-menu">
		<div class="overlay" @click="!preventClickOutside && closeDrawer()" />
		<div class="drawer-container" :class="theme">
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
	opacity: 0;
	visibility: hidden;
	transform: translate3d(0, 20px, 0);
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
		max-height: calc(100vh - var(--header-height) - var(--drawer-socials-height) - var(--gutter) * 2);
	}

	.drawer-content-container {
		@include hide-scrollbar;

		max-height: calc(
			100vh - var(--header-height) - var(--drawer-socials-height) - var(--drawer-title-height) - var(--gutter) * 2
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
