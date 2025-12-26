import gsap from 'gsap';
import type { Directive, DirectiveBinding } from 'vue';

import { breakPointsNoUnits } from '#utils/breakpoints.ts';
import { isTouchDevice } from '#utils/device.ts';

type ParallaxOptions = {
	mobile?: number;
	tablet?: number;
	desktop?: number;
	value?: number;
	scale?: boolean;
};

const vParallax: Directive = {
	mounted(el: HTMLElement, binding: DirectiveBinding<number | ParallaxOptions>) {
		if (isTouchDevice()) return;

		const options = typeof binding.value === 'object' ? binding.value : { value: binding.value };
		const scaleEnabled = options.scale ?? true;
		const defaultValue = options.value ?? 0;

		const mm = gsap.matchMedia();
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: el,
				start: 'top bottom',
				end: 'bottom top',
				scrub: 1
			}
		});

		mm.add(
			{
				isMobile: `(max-width: ${breakPointsNoUnits.tablet - 1}px)`,
				isTablet: `(min-width: ${breakPointsNoUnits.tablet}px) and (max-width: ${breakPointsNoUnits.desktop - 1}px)`,
				isDesktop: `(min-width: ${breakPointsNoUnits.desktop}px)`
			},
			(context) => {
				const { isMobile, isTablet, isDesktop } = context.conditions as {
					isMobile: boolean;
					isTablet: boolean;
					isDesktop: boolean;
				};

				let parallaxValue = defaultValue;

				if (isMobile && options.mobile !== undefined) parallaxValue = options.mobile;
				if (isTablet && options.tablet !== undefined) parallaxValue = options.tablet;
				if (isDesktop && options.desktop !== undefined) parallaxValue = options.desktop;

				const scale = scaleEnabled ? 1 + Math.abs(parallaxValue) / 100 : 1;

				tl.clear();
				tl.fromTo(el, { yPercent: 0, scale: scale }, { yPercent: parallaxValue, scale: scale, ease: 'none' });
			}
		);

		(el as any).__parallax_cleanup__ = () => {
			mm.revert();
			tl.scrollTrigger?.kill();
			tl.kill();
		};
	},
	unmounted(el: HTMLElement) {
		if ((el as any).__parallax_cleanup__) {
			(el as any).__parallax_cleanup__();
		}
	}
};

export default vParallax;
