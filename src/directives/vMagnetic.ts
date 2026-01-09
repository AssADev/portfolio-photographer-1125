import gsap from 'gsap';
import type { Directive, DirectiveBinding } from 'vue';

import { isTouchDevice } from '#utils/device.ts';

type MagneticOptions = {
	strength?: number;
	range?: number;
	parallax?: {
		target: string;
		strength: number;
	};
};

/**
 * Global tracker to ensure only one element is magnetic at a time.
 */
let currentMagneticEl: HTMLElement | null = null;

const vMagnetic: Directive = {
	mounted(el: HTMLElement, binding: DirectiveBinding<MagneticOptions>) {
		if (isTouchDevice()) return;

		// Props
		const strength = binding.value?.strength ?? 0.5;
		const range = binding.value?.range ?? 100;
		const parallax = binding.value?.parallax;

		// State
		let isHovering = false;
		let parallaxTarget: HTMLElement | null = null;

		// GSAP setters
		const xTo = gsap.quickTo(el, 'x', { duration: 1, ease: 'power1' });
		const yTo = gsap.quickTo(el, 'y', { duration: 1, ease: 'power1' });

		let xToParallax: gsap.QuickToFunc | null = null;
		let yToParallax: gsap.QuickToFunc | null = null;

		if (parallax?.target) {
			parallaxTarget = el.querySelector(parallax.target);
			if (parallaxTarget) {
				parallaxTarget.classList.add('parallax-target');
				xToParallax = gsap.quickTo(parallaxTarget, 'x', { duration: 1, ease: 'power1' });
				yToParallax = gsap.quickTo(parallaxTarget, 'y', { duration: 1, ease: 'power1' });
			}
		}

		/**
		 * Calculate if the mouse is within the "magnetic zone"
		 */
		const onMouseMove = (e: MouseEvent) => {
			// If another element stole the focus, we shut down :
			if (currentMagneticEl !== el) {
				if (isHovering) onMouseLeave();
				return;
			}

			const rect = el.getBoundingClientRect();

			// Get current translates and find ORIGINAL position :
			const curX = (gsap.getProperty(el, 'x') as number) || 0;
			const curY = (gsap.getProperty(el, 'y') as number) || 0;

			const origLeft = rect.left - curX;
			const origTop = rect.top - curY;
			const origCenterX = origLeft + rect.width / 2;
			const origCenterY = origTop + rect.height / 2;

			/**
			 * DEACTIVATION CHECK :
			 * We want to stop if the mouse is no longer over the element.
			 * We check both the ORIGINAL bounds and the CURRENT (moving) bounds
			 * to ensure a smooth handoff, with a tiny 10px buffer to avoid jitter.
			 */
			const buffer = 10;
			const isOverOriginal =
				e.clientX >= origLeft - buffer &&
				e.clientX <= origLeft + rect.width + buffer &&
				e.clientY >= origTop - buffer &&
				e.clientY <= origTop + rect.height + buffer;

			const isOverCurrent =
				e.clientX >= rect.left - buffer &&
				e.clientX <= rect.left + rect.width + buffer &&
				e.clientY >= rect.top - buffer &&
				e.clientY <= rect.top + rect.height + buffer;

			if (isOverOriginal || isOverCurrent) {
				// Linear attraction logic :
				const deltaX = e.clientX - origCenterX;
				const deltaY = e.clientY - origCenterY;

				xTo(deltaX * strength);
				yTo(deltaY * strength);

				if (xToParallax && yToParallax && parallax) {
					xToParallax(deltaX * parallax.strength);
					yToParallax(deltaY * parallax.strength);
				}
			} else {
				// Mouse is truly gone
				onMouseLeave();
			}
		};

		const onMouseLeave = () => {
			if (!isHovering) return;
			isHovering = false;

			if (currentMagneticEl === el) {
				currentMagneticEl = null;
			}

			xTo(0);
			yTo(0);

			if (xToParallax && yToParallax) {
				xToParallax(0);
				yToParallax(0);
			}

			window.removeEventListener('mousemove', onMouseMove);
		};

		const onMouseEnter = () => {
			if (currentMagneticEl === el && isHovering) return;

			isHovering = true;
			currentMagneticEl = el;

			window.addEventListener('mousemove', onMouseMove);
		};

		// Event registration
		el.addEventListener('mouseenter', onMouseEnter);

		// Fallback activation
		const onFallbackMove = () => {
			if (!isHovering) onMouseEnter();
		};
		el.addEventListener('mousemove', onFallbackMove);

		// Cleanup function
		(el as any).__magnetic_cleanup__ = () => {
			el.removeEventListener('mouseenter', onMouseEnter);
			el.removeEventListener('mousemove', onFallbackMove);
			onMouseLeave();
		};
	},
	unmounted(el: HTMLElement) {
		if ((el as any).__magnetic_cleanup__) {
			(el as any).__magnetic_cleanup__();
		}
	}
};

export default vMagnetic;
