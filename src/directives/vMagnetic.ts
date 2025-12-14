import gsap from 'gsap';
import type { Directive, DirectiveBinding } from 'vue';

import { isTouchDevice } from '#utils/device.ts';

type MagneticOptions = {
	strength?: number;
	range?: number;
};

const vMagnetic: Directive = {
	mounted(el: HTMLElement, binding: DirectiveBinding<MagneticOptions>) {
		if (isTouchDevice()) return;

		// Props :
		const strength = binding.value?.strength ?? 0.5;
		const range = binding.value?.range ?? 100;

		// Variables :
		const pos = {
			x: 0,
			y: 0,
			finalX: 0,
			finalY: 0
		};

		const distance = {
			value: 0,
			x: 0,
			y: 0
		};

		let width = 0;
		let height = 0;
		let isHovering = false;
		let rect: DOMRect | null = null;

		// GSAP :
		const xTo = gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' });
		const yTo = gsap.quickTo(el, 'y', { duration: 1, ease: 'power3' });

		// Methods :
		const onMouseMove = (e: MouseEvent) => {
			if (!rect) return;

			distance.x = e.clientX - pos.x;
			distance.y = e.clientY - pos.y;

			distance.value = Math.sqrt(distance.x * distance.x + distance.y * distance.y);

			// Check the distance :
			if (distance.value < Math.max(width, height) / 2 + range) {
				pos.finalX = distance.x * strength;
				pos.finalY = distance.y * strength;

				xTo(pos.finalX);
				yTo(pos.finalY);
			} else {
				onMouseLeave();
			}
		};

		const onMouseLeave = () => {
			if (!isHovering) return;
			isHovering = false;

			xTo(0);
			yTo(0);

			window.removeEventListener('mousemove', onMouseMove);
		};

		const onMouseEnter = () => {
			if (isHovering) return;
			isHovering = true;

			rect = el.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
			pos.x = rect.left + width / 2;
			pos.y = rect.top + height / 2;

			window.addEventListener('mousemove', onMouseMove);
		};

		// Events :
		el.addEventListener('mouseenter', onMouseEnter);

		// Store cleanup :
		(el as any).__magnetic_cleanup__ = () => {
			el.removeEventListener('mouseenter', onMouseEnter);
			window.removeEventListener('mousemove', onMouseMove);
		};
	},
	unmounted(el: HTMLElement) {
		if ((el as any).__magnetic_cleanup__) {
			(el as any).__magnetic_cleanup__();
		}
	}
};

export default vMagnetic;
