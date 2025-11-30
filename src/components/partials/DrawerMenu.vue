<script setup lang="ts">
import { useVModel } from '@nanostores/vue';
import gsap from 'gsap';
import { onMounted, useTemplateRef, watch } from 'vue';

import MenuSocials from '#components/partials/MenuSocials.vue';

import { useAnimateHeight } from '#composables/useAnimateHeight.ts';
import { useTrap } from '#composables/useTrap.ts';
import { $global } from '#stores/global.ts';

// Props & Model :
const { theme = 'dark' } = defineProps<{
	theme?: 'dark' | 'light';
}>();

const [innerEl, outerEl] = useAnimateHeight();

const lockScroll = useVModel($global, 'lockScroll');
const toggled = defineModel<boolean>('toggled', { default: false });

// Refs :
const drawerRef = useTemplateRef('drawerRef');
let tl: gsap.core.Timeline | null = null;

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

onMounted(() => {
	gsap.set(drawerRef.value, { autoAlpha: 0, y: 20 });
});

watch(toggled, (isToggled) => {
	isToggled ? openDrawer() : closeDrawer();
});

useTrap(drawerRef, { model: toggled, clickOutsideDeactivates: true, escapeDeactivates: true });
</script>

<template>
	<div ref="drawerRef" class="drawer-menu">
		<div class="drawer-container" :class="theme">
			<div v-if="$slots.title" class="drawer-title-container">
				<slot name="title" />
			</div>
			<div ref="outerEl" class="drawer-content-container">
				<div ref="innerEl" class="drawer-inner-container">
					<slot />
				</div>
			</div>
			<MenuSocials />
		</div>
	</div>
</template>

<style scoped lang="scss">
.drawer-menu {
	--menu-padding-inline: 14px;

	position: fixed;
	bottom: var(--gutter);
	right: var(--gutter);
	z-index: 25;
	max-width: 365px;
	width: 100%;
	opacity: 0;
	visibility: hidden;
	transform: translate3d(0, 20px, 0);
}

.drawer-container {
	width: 100%;
	height: fit-content;
	border-radius: var(--border-radius);
	overflow: hidden;

	&.dark {
		color: $white;
		background: $eerieBlack;

		.drawer-title-container {
			border-bottom: 1px solid rgba($white, 0.08);
		}

		.drawer-content-container {
			border-bottom: 1px solid rgba($white, 0.08);
		}
	}

	&.light {
		color: $eerieBlack;
		background: $whiteChoco;

		.drawer-title-container {
			border-bottom: 1px solid rgba($eerieBlack, 0.08);
		}

		.drawer-content-container {
			border-bottom: 1px solid rgba($eerieBlack, 0.08);
		}
	}
}

.drawer-title-container {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 20px var(--menu-padding-inline) 16px;

	:deep(.title) {
		@include roobert-20;
	}

	:deep(.description) {
		@include roobert-14;

		opacity: 0.5;
	}
}

.drawer-content-container {
	overflow: hidden;
	transition: height 0.4s $power2Out;
}
</style>
