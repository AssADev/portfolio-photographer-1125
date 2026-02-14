import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Directive } from 'vue';

import { type AnimationOptions, animations } from '#utils/Animations.ts';

interface AnimateBinding {
	type: string;
	options?: AnimationOptions;
}

const init = (el: HTMLElement & { _gsapAnim?: gsap.core.Animation }, binding: any) => {
	const value = binding.value;
	const type = typeof value === 'string' ? value : value.type;
	const options = typeof value === 'string' ? {} : value.options || {};

	// If containerAnimation is expected but not yet ready, we wait :
	// if ('containerAnimation' in options && !options.containerAnimation) return;

	// If we already have a ScrollTrigger for this element, we don't recreate it :
	const existingST = ScrollTrigger.getAll().find((st) => st.trigger === el);
	if (existingST) return;

	const animationFn = animations[type];
	if (!animationFn) {
		console.warn(`[v-animate] Animation type "${type}" not found.`);
		return;
	}

	const anim = animationFn(el, options);
	el._gsapAnim = anim;

	if (anim instanceof gsap.core.Timeline || anim instanceof gsap.core.Tween) {
		ScrollTrigger.create({
			trigger: el,
			once: true,
			animation: anim,
			toggleActions: 'play none none none',
			start: options.start || 'top bottom'
		});
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
