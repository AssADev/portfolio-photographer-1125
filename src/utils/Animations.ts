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

	'mask-reveal': (el, options) => {
		const direction = options.direction || 'up';
		const axis = direction === 'up' || direction === 'down' ? 'Y' : 'X';

		return gsap.from(el, {
			clipPath:
				direction === 'up'
					? 'inset(100% 0% 0% 0%)'
					: direction === 'down'
						? 'inset(0% 0% 100% 0%)'
						: direction === 'left'
							? 'inset(0% 0% 0% 100%)'
							: 'inset(0% 100% 0% 0%)',
			y: axis === 'Y' ? (direction === 'up' ? 75 : -75) : 0,
			x: axis === 'X' ? (direction === 'left' ? 75 : -75) : 0,
			duration: 1.6,
			delay: options.delay || 0,
			ease: 'power3.inOut',
			immediateRender: true
		});
	},

	'reveal-letters': (el, options) => {
		const split = new SplitText(el, { type: 'words,chars', mask: 'chars', autoSplit: true });
		const chars = split.chars;

		return gsap.from(chars, {
			x: '120%',
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

	'reveal-paragraphs': (el, options) => {
		const originalHTML = el.innerHTML;
		el.innerHTML = originalHTML.replace(/<br\s*\/?>/gi, '\u200B<br>\u200B');

		const split = new SplitText(el, { type: 'lines', mask: 'lines', autoSplit: true });
		const lines = split.lines;

		return gsap.from(lines, {
			y: '120%',
			rotateZ: '15deg',
			duration: 1.1,
			stagger: 0.075,
			ease: 'power4.out',
			transformOrigin: 'left center',
			delay: options.delay || 0,
			immediateRender: true,
			onComplete: () => {
				if (options.revert !== false) {
					split.revert();
					el.innerHTML = originalHTML;
				}
			}
		});
	},

	'reveal-titles': (el, options) => {
		const originalHTML = el.innerHTML;
		el.innerHTML = originalHTML.replace(/<br\s*\/?>/gi, '\u200B<br>\u200B');

		const split = new SplitText(el, { type: 'lines', linesClass: 'line', autoSplit: true });
		const lines = split.lines;

		const tl = gsap.timeline({
			delay: options.delay || 0,
			onComplete: () => {
				if (options.revert !== false) {
					split.revert();
					el.innerHTML = originalHTML;
				}
			}
		});

		lines.forEach((line, index) => {
			const wrapper = document.createElement('div');
			wrapper.className = 'reveal-titles-line-wrapper';
			line.parentNode?.insertBefore(wrapper, line);
			wrapper.appendChild(line);

			const block = document.createElement('div');
			block.className = 'reveal-titles-block-revealer';
			wrapper.appendChild(block);

			// Animation :
			const lineTl = gsap.timeline();

			lineTl.to(block, {
				scaleX: 1,
				duration: 0.8,
				ease: 'power4.inOut'
			});

			lineTl.set(line, { opacity: 1 });
			lineTl.set(block, { transformOrigin: 'right center' });

			lineTl.to(block, {
				scaleX: 0,
				duration: 0.8,
				ease: 'power4.inOut'
			});

			tl.add(lineTl, index * 0.15);
		});

		return tl;
	},

	'scale-up': (el, options) => {
		return gsap.from(el, {
			scale: 0.25,
			opacity: 0,
			duration: 1.2,
			ease: 'power3.out',
			delay: options.delay || 0,
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
