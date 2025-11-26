import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import LenisVue from 'lenis/vue';
import type { App } from 'vue';

import { getState } from '#utils/astro-state.ts';
import { getLocale, t } from '#utils/i18n.ts';

let gsapInitialized = false;

export default (app: App) => {
	app.config.globalProperties.$t = t;

	app.use(LenisVue);
	app.provide('language', getLocale());
	app.provide('isPreviewMode', getState('isPreviewMode', false));

	// Make sure to register GSAP only once for the whole app :
	if (!import.meta.env.SSR && !gsapInitialized) {
		gsap.registerPlugin(ScrollTrigger, SplitText);
		gsapInitialized = true;
	}
};

declare module 'vue' {
	interface ComponentCustomProperties {
		$t: typeof t;
	}
}
