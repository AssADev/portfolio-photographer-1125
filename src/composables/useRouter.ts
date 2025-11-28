import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';
import { onMounted, onUnmounted, ref } from 'vue';

import { getState } from '#utils/astro-state.ts';

import { $global } from '#stores/global.ts';

export const waitAfterLoad = new Set<Promise<any>>();

type UserRouterOptions = {
	beforePreparation?: (event: TransitionBeforePreparationEvent) => void;
	afterLoad?: (event: Event) => void;
	beforeLoad?: () => Promise<void>;
};

export const useRouter = ({ beforePreparation, afterLoad: afterSwap, beforeLoad }: UserRouterOptions = {}) => {
	const loading = ref(false);
	const isPrevNext = ref(false);
	const nextUrl = ref<string | null>(null);
	const location = ref(import.meta.env.SSR ? new URL(getState('url') as string) : new URL(window.location.href));

	const beforePreparationListener = (e: TransitionBeforePreparationEvent) => {
		loading.value = true;
		isPrevNext.value = e.navigationType === 'traverse';
		nextUrl.value = e.to.href;
		$global.setKey('lockScroll', false);

		beforePreparation?.(e);

		const originalLoader = e.loader;
		e.loader = async () => {
			await beforeLoad?.();
			await originalLoader();
		};
	};

	const pageLoadListener = async (e: Event) => {
		await Promise.all(Array.from(waitAfterLoad));
		waitAfterLoad.clear();

		afterSwap?.(e);
		loading.value = false;
		location.value = new URL(window.location.href);
	};

	onMounted(() => {
		document.addEventListener('astro:before-preparation', beforePreparationListener);
		document.addEventListener('astro:page-load', pageLoadListener);
	});

	onUnmounted(() => {
		document.removeEventListener('astro:before-preparation', beforePreparationListener);
		document.removeEventListener('astro:page-load', pageLoadListener);
	});

	return { loading, isPrevNext, location, nextUrl };
};
