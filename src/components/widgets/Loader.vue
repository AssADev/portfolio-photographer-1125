<script setup lang="ts">
import gsap from 'gsap';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { breakPointsNoUnits } from '#utils/breakpoints.ts';

import { $global } from '#stores/global.ts';

const props = defineProps<{
	identity: string;
}>();

// Refs :
const isTablet = ref(false);
const isDesktop = ref(false);
const isVisible = ref(true);

const containerRef = ref<HTMLElement | null>(null);

// Computed :
const panelCount = computed(() => (isDesktop.value ? 13 : isTablet.value ? 9 : 7));

// Methods :
const showApp = () => {
	(window as any).isSiteLoaded = true;
	document.documentElement.classList.remove('is-site-loading');
};

const clearAppVisibility = () => {
	if ($global.get().isSiteLoaded) showApp();
};

const checkBreakpoint = () => {
	isTablet.value = window.innerWidth >= breakPointsNoUnits.tablet;
	isDesktop.value = window.innerWidth >= breakPointsNoUnits.desktop;
};

// Animations :
const ANIMATION_OPTS = {
	duration: 1.1,
	stagger: 0.05,
	ease: 'power2.inOut'
};

const animateOut = () => {
	if (!containerRef.value) return;

	showApp();

	setTimeout(() => {
		$global.setKey('isSiteLoaded', true);
	}, 200);

	const topPanels = containerRef.value.querySelectorAll('.panel-top');
	const bottomPanels = containerRef.value.querySelectorAll('.panel-bottom');

	const tl = gsap.timeline({
		defaults: ANIMATION_OPTS,
		onComplete: () => {
			isVisible.value = false;
			$global.setKey('lockScroll', false);
		}
	});

	// Bars :
	tl.to(topPanels, { scaleY: 0, transformOrigin: 'top' }, 0);
	tl.to(bottomPanels, { scaleY: 0, transformOrigin: 'bottom' }, 0);
};

// Attach & Detach :
onMounted(() => {
	checkBreakpoint();
	window.addEventListener('resize', checkBreakpoint);
	document.addEventListener('astro:page-load', clearAppVisibility);

	const skipLoader = new URLSearchParams(window.location.search).has('skipLoader');

	if (skipLoader || $global.get().isSiteLoaded) {
		isVisible.value = false;
		showApp();
		setTimeout(() => {
			$global.setKey('isSiteLoaded', true);
		}, 200);
		return;
	}

	window.scrollTo(0, 0);

	$global.setKey('lockScroll', true);
	$global.setKey('isSiteLoaded', false);

	const startOutAnimation = () => {
		// add a small delay to make sure we show the identity nicely
		// also, wait a bit so the browser can settle before animating heavily out
		setTimeout(() => {
			animateOut();
		}, 100);
	};

	if (document.readyState === 'complete') {
		startOutAnimation();
	} else {
		window.addEventListener('load', startOutAnimation);
	}
});

onUnmounted(() => {
	window.removeEventListener('resize', checkBreakpoint);
	document.removeEventListener('astro:page-load', clearAppVisibility);
});
</script>

<template>
	<div v-if="isVisible" ref="containerRef" aria-hidden="true" class="loader-container">
		<div class="interloader">
			<div v-for="i in panelCount" :key="i" class="panel-wrapper">
				<div class="panel-top"></div>
				<div class="panel-bottom"></div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.loader-container {
	position: fixed;
	inset: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	touch-action: none;
}

.interloader {
	position: absolute;
	inset: 0;
	display: flex;
	width: 100%;
	height: 100%;

	@include lvh(100);
}

.panel-wrapper {
	display: flex;
	flex-direction: column;
	flex: 1;
	height: 100%;
	overflow: hidden;
}

.panel-top,
.panel-bottom {
	width: 105%;
	height: 100%;
	background: $whiteChoco;
}
</style>
