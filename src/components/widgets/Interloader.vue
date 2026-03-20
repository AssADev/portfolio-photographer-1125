<script setup lang="ts">
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { breakPointsNoUnits } from '#utils/breakpoints.ts';

import { useDeferredLoading } from '#composables/useDeferredLoading.ts';
import { useRouter } from '#composables/useRouter.ts';
import { $global } from '#stores/global.ts';

// Constants :
const ANIMATION_DURATION = 1500; // ms

// Refs :
const isTablet = ref(false);
const isDesktop = ref(false);

// Composables :
const { loading } = useRouter({
	beforeLoad: () => new Promise((resolve) => setTimeout(resolve, ANIMATION_DURATION))
});

const deferredLoading = useDeferredLoading(loading, {
	loadDuration: ANIMATION_DURATION,
	delayAfterLoad: 50,
	delayBeforeLoad: 0
});

// Methods :
const checkBreakpoint = () => {
	isTablet.value = window.innerWidth >= breakPointsNoUnits.tablet;
	isDesktop.value = window.innerWidth >= breakPointsNoUnits.desktop;
};

// Attach & Detach :
onMounted(() => {
	checkBreakpoint();
	window.addEventListener('resize', checkBreakpoint);
});

onUnmounted(() => {
	window.removeEventListener('resize', checkBreakpoint);
});

// Computed :
const visible = computed(() => deferredLoading.value);
const panelCount = computed(() => (isDesktop.value ? 13 : isTablet.value ? 9 : 7));

// Animations :
const ANIMATION_OPTS = {
	duration: 1.1,
	stagger: 0.05,
	ease: 'power2.inOut'
};

const onEnter = (el: Element, done: () => void) => {
	$global.setKey('lockScroll', true);

	const container = el as HTMLElement;
	const topPanels = container.querySelectorAll('.panel-top');
	const bottomPanels = container.querySelectorAll('.panel-bottom');

	gsap.timeline({
		defaults: ANIMATION_OPTS,
		onComplete: done
	})
		.fromTo(topPanels, { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1.05 }, 0)
		.fromTo(bottomPanels, { scaleY: 0, transformOrigin: 'bottom' }, { scaleY: 1.05 }, 0);
};

const onLeave = (el: Element, done: () => void) => {
	const container = el as HTMLElement;
	const topPanels = container.querySelectorAll('.panel-top');
	const bottomPanels = container.querySelectorAll('.panel-bottom');

	gsap.timeline({
		defaults: ANIMATION_OPTS,
		onComplete: () => {
			$global.setKey('lockScroll', false);
			ScrollTrigger.refresh();
			done();
		}
	})
		.to(topPanels, { scaleY: 0, transformOrigin: 'top' }, 0)
		.to(bottomPanels, { scaleY: 0, transformOrigin: 'bottom' }, 0);
};
</script>

<template>
	<Transition :css="false" @enter="onEnter" @leave="onLeave">
		<div v-if="visible" aria-hidden="true" class="interloader-container">
			<div class="interloader">
				<div v-for="i in panelCount" :key="i" class="panel-wrapper">
					<div class="panel-top"></div>
					<div class="panel-bottom"></div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style lang="scss" scoped>
.interloader-container {
	position: fixed;
	inset: 0;
	z-index: 100;
	overflow: hidden;
	touch-action: none;
}

.interloader {
	position: relative;
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
