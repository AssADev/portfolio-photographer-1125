import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Directive } from 'vue';

import { type AnimationOptions, animations } from '#utils/Animations.ts';

interface AnimateBinding {
	type: string;
	options?: AnimationOptions;
}

const vAnimate: Directive<HTMLElement, string | AnimateBinding> = {
	mounted(el, binding) {
		const value = binding.value;
		const type = typeof value === 'string' ? value : value.type;
		const options = typeof value === 'string' ? {} : value.options || {};

		const animationFn = animations[type];

		if (!animationFn) {
			console.warn(`[v-animate] Animation type "${type}" not found.`);
			return;
		}

		// Configure ScrollTrigger :
		const scrollTrigger: any = {
			trigger: el,
			once: true,
			start: options.start || 'top bottom',
			toggleActions: 'play none none none'
		};

		// Create the animation :
		const anim = animationFn(el, options);

		if (anim instanceof gsap.core.Timeline || anim instanceof gsap.core.Tween) {
			ScrollTrigger.create({
				...scrollTrigger,
				animation: anim
			});
		}
	},
	unmounted(el) {
		ScrollTrigger.getAll().forEach((st) => {
			if (st.trigger === el) st.kill();
		});
	}
};

export default vAnimate;
