<script setup lang="ts">
import gsap from 'gsap';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { breakPointsNoUnits } from '#utils/breakpoints.ts';

import { useDeferredLoading } from '#composables/useDeferredLoading.ts';
import { useRouter } from '#composables/useRouter.ts';
import { $global } from '#stores/global.ts';

// Constants :
const ANIMATION_DURATION = 0; // ms

// Refs :
const isDesktop = ref(false);

// Composables :
const { loading, isPrevNext } = useRouter({
	beforeLoad: () => new Promise((resolve) => setTimeout(resolve, ANIMATION_DURATION))
});

const deferredLoading = useDeferredLoading(loading, {
	loadDuration: ANIMATION_DURATION,
	delayAfterLoad: 50,
	delayBeforeLoad: 0
});

// Methods :
const checkBreakpoint = () => {
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
const visible = computed(() => deferredLoading.value && !isPrevNext.value);
const panelCount = computed(() => (isDesktop.value ? 6 : 4));

// Animations :
const onEnter = (el: Element, done: () => void) => {
	$global.setKey('lockScroll', true);

	const panels = (el as HTMLElement).querySelectorAll('.panel-wrapper .panel');
	gsap.fromTo(
		panels,
		{ scaleX: 0, transformOrigin: 'left' },
		{
			scaleX: 1.05,
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
		scaleX: 0,
		duration: 1,
		stagger: 0.1,
		transformOrigin: 'right',
		ease: 'power2.inOut',
		onComplete: () => {
			$global.setKey('lockScroll', false);
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
