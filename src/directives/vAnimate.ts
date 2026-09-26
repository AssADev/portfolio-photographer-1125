import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type Directive, nextTick } from 'vue';

import { type AnimationOptions, animations } from '#utils/Animations.ts';
import { $global } from '#stores/global.ts';

interface AnimateBinding {
	type: string;
	options?: AnimationOptions;
}

const pendingElements = new Map<HTMLElement, any>();
let unsubscribe: (() => void) | null = null;

const processPendingElements = () => {
	if (!$global.get().isSiteLoaded) return;

	// A single element failing to initialize (e.g. a GSAP/ScrollTrigger error) must not prevent
	// the others from being processed, and the map/listener must always be cleaned up :
	pendingElements.forEach((binding, el) => {
		try {
			init(el, binding);
		} catch (error) {
			console.error('[v-animate] Failed to initialize an animation.', error, el);
		}
	});
	pendingElements.clear();
	if (unsubscribe) {
		unsubscribe();
		unsubscribe = null;
	}
};

const init = (el: HTMLElement & { _gsapAnim?: gsap.core.Animation }, binding: any) => {
	if (!$global.get().isSiteLoaded) {
		pendingElements.set(el, binding);
		if (!unsubscribe) {
			unsubscribe = $global.listen(() => {
				processPendingElements();
			});
		}
		return;
	}

	const value = binding.value;
	const type = typeof value === 'string' ? value : value.type;
	const options = typeof value === 'string' ? {} : value.options || {};

	// If containerAnimation is expected but not yet ready, we wait :
	if ('containerAnimation' in options && !options.containerAnimation) return;

	// If we already have a ScrollTrigger for this element, we don't recreate it :
	const existingST = ScrollTrigger.getAll().find((st) => st.trigger === el);
	if (existingST || el._gsapAnim) return;

	const animationFn = animations[type];
	if (!animationFn) {
		console.warn(`[v-animate] Animation type "${type}" not found.`);
		return;
	}

	const anim = animationFn(el, options);
	el._gsapAnim = anim;

	// Once the animation is initialized, hide the trigger attribute :
	el.removeAttribute('data-v-animate');

	if (anim instanceof gsap.core.Timeline || anim instanceof gsap.core.Tween) {
		try {
			ScrollTrigger.create({
				trigger: el,
				once: true,
				animation: anim,
				toggleActions: 'play none none none',
				containerAnimation: options.containerAnimation,
				start: options.start || (options.containerAnimation ? 'left bottom' : 'top bottom')
			});
		} catch (error) {
			// A stale/orphaned ScrollTrigger left over from a previous page (Astro islands aren't
			// unmounted on client-side navigation) can corrupt GSAP's internal pin recalculation and
			// make ScrollTrigger.create() throw. If that happens, fall back to just playing the
			// animation immediately rather than leaving the element permanently hidden :
			console.error('[v-animate] ScrollTrigger.create() failed, playing the animation immediately.', error, el);
			anim.play();
		}
	}
};

const vAnimate: Directive<HTMLElement & { _gsapAnim?: gsap.core.Animation }, string | AnimateBinding> = {
	mounted(el, binding) {
		init(el, binding);
	},
	updated(el, binding) {
		init(el, binding);
	},
	unmounted(el) {
		pendingElements.delete(el);
		ScrollTrigger.getAll().forEach((st) => {
			if (st.trigger === el) st.kill();
		});
		if (el._gsapAnim) {
			el._gsapAnim.kill();
			delete el._gsapAnim;
		}
	}
};

export default vAnimate;
