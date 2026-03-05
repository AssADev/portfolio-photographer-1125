<script setup lang="ts">
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { breakPointsNoUnits } from '#utils/breakpoints.ts';

import { useDeferredLoading } from '#composables/useDeferredLoading.ts';
import { useRouter } from '#composables/useRouter.ts';
import { $global } from '#stores/global.ts';

// Constants :
const ANIMATION_DURATION = 0; // ms

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
const panelCount = computed(() => (isDesktop.value ? 9 : isTablet.value ? 7 : 5));

// Animations :
const onEnter = (el: Element, done: () => void) => {
	$global.setKey('lockScroll', true);

	const panels = (el as HTMLElement).querySelectorAll('.panel-wrapper .panel');
	gsap.fromTo(
		panels,
		// Un sur deux c'est top sinon c'est bottom :
		{ scaleY: 0, transformOrigin: (index: number) => (index % 2 === 0 ? 'bottom' : 'top') },
		{
			scaleY: 1.05,
			duration: 0.8,
			stagger: 0.1,
			ease: 'power2.inOut',
			onComplete: done
		}
	);
};

const onLeave = (el: Element, done: () => void) => {
	const panels = (el as HTMLElement).querySelectorAll('.panel-wrapper .panel');
	gsap.to(panels, {
		scaleY: 0,
		duration: 1,
		stagger: 0.1,
		transformOrigin: (index: number) => (index % 2 === 0 ? 'top' : 'bottom'),
		ease: 'power2.inOut',
		onComplete: () => {
			$global.setKey('lockScroll', false);
			ScrollTrigger.refresh();
			done();
		}
	});
};
</script>

<template>
	<Transition :css="false" @enter="onEnter" @leave="onLeave">
		<div v-if="visible" aria-hidden="true" class="interloader-container">
			<div class="interloader">
				<div v-for="i in panelCount" :key="i" class="panel-wrapper">
					<div class="panel"></div>
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
	flex: 1;
	height: 100%;
	overflow: hidden;
}

.panel {
	width: 100%;
	height: 100%;
	background: $whiteChoco;
}
</style>
