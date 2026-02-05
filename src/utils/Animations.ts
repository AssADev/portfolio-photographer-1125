import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

export type AnimationType = 'fade-up' | 'fade-in' | 'split-text' | 'mask-up';

export interface AnimationOptions {
	delay?: number;
	start?: string;
	revert?: boolean;
	direction?: 'up' | 'down' | 'left' | 'right';
	[key: string]: any;
}

export const animations: Record<string, (el: HTMLElement, options: AnimationOptions) => gsap.core.Animation> = {
	'fade-up': (el, options) => {
		return gsap.from(el, {
			y: 40,
			opacity: 0,
			duration: 1,
			ease: 'power3.out',
			delay: options.delay || 0,
			immediateRender: true
		});
	},

	'fade-in': (el, options) => {
		return gsap.from(el, {
			opacity: 0,
			duration: 1,
			ease: 'power3.out',
			delay: options.delay || 0,
			immediateRender: true
		});
	},

	'reveal-paragraphs': (el, options) => {
		const split = new SplitText(el, { type: 'lines', mask: 'lines', autoSplit: true });
		const target = split.lines;

		return gsap.from(target, {
			y: '120%',
			rotateZ: '15deg',
			duration: 1.1,
			stagger: 0.075,
			ease: 'power4.out',
			transformOrigin: 'left center',
			delay: options.delay || 0,
			immediateRender: true,
			onComplete: () => {
				if (options.revert !== false) split.revert();
			}
		});
	},

	'mask-reveal': (el, options) => {
		const direction = options.direction || 'up';
		const axis = direction === 'up' || direction === 'down' ? 'Y' : 'X';
		const amount = direction === 'up' || direction === 'left' ? '100%' : '-100%';

		return gsap.from(el, {
			clipPath:
				direction === 'up'
					? 'inset(100% 0% 0% 0%)'
					: direction === 'down'
						? 'inset(0% 0% 100% 0%)'
						: direction === 'left'
							? 'inset(0% 0% 0% 100%)'
							: 'inset(0% 100% 0% 0%)',
			y: axis === 'Y' ? (direction === 'up' ? 50 : -50) : 0,
			x: axis === 'X' ? (direction === 'left' ? 50 : -50) : 0,
			duration: 1.6,
			delay: options.delay || 0,
			ease: 'power4.inOut',
			immediateRender: true
		});
	},

	'stagger-list': (el, options) => {
		const children = el.children;
		return gsap.from(children, {
			y: 40,
			opacity: 0,
			duration: 1,
			stagger: 0.1,
			ease: 'power3.out',
			immediateRender: true
		});
	}
};
