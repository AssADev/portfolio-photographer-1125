import gsap from 'gsap';
// import { CustomEase } from 'gsap/CustomEase';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { SplitText } from 'gsap/SplitText';
import LenisVue from 'lenis/vue';
import type { App } from 'vue';

let gsapInitialized = false;

export default (app: App) => {
	app.use(LenisVue);

	// Make sure to register GSAP only once for the whole app :
	// if (!import.meta.env.SSR && !gsapInitialized) {
	// 	gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
	// 	CustomEase.create('immg.zoomIn', '0.9, 0.0, 0.4, 1.0');
	// 	CustomEase.create('immg.zoomOut', '0.4, 0.0, 0.1, 1.0');
	// 	CustomEase.create('immg.posIn', '0.4, 0.0, 0.1, 1.0');
	// 	CustomEase.create('immg.posOut', '0.9, 0.0, 0.4, 1.0');
	// 	CustomEase.create('immg.expoOut', '0.14, 1.0, 0.34, 1.0');
	// 	CustomEase.create('immg.expoIn', '0.66, 0.0, 0.86, 0.0');
	// 	gsapInitialized = true;
	// }
};
