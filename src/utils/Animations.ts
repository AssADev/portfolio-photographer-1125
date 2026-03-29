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
	'fade-in': (el, options) => {
		return gsap.from(el, {
			opacity: 0,
			duration: 1.2,
			ease: 'power2.inOut',
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
					? 'inset(101% 0% 0% 0%)'
					: direction === 'down'
						? 'inset(0% 0% 101% 0%)'
						: direction === 'left'
							? 'inset(0% 0% 0% 101%)'
							: 'inset(0% 101% 0% 0%)',
			y: axis === 'Y' && options.withTranslate ? (direction === 'up' ? 75 : -75) : 0,
			x: axis === 'X' && options.withTranslate ? (direction === 'left' ? 75 : -75) : 0,
			duration: 1.6,
			delay: options.delay || 0,
			ease: 'power3.inOut',
			immediateRender: true
		});
	},

	'reveal-button-dot': (el, options) => {
		const tl = gsap.timeline({
			delay: options.delay || 0
		});

		// Animation :
		tl.from(el, {
			clipPath: 'inset(0% 100% 100% 0%)',
			duration: 1.2,
			ease: 'power3.inOut',
			pointerEvents: 'none',
			immediateRender: true,
			onComplete: () => {
				gsap.set(el, { clearProps: 'all' });
			}
		});

		// Animation of the dot :
		const dot = el.querySelector('svg');
		if (dot) {
			tl.from(
				dot,
				{
					scale: 0,
					rotateZ: 90,
					delay: 0.65,
					duration: 0.4,
					ease: 'power2.out',
					transition: 'none',
					immediateRender: true,
					transformOrigin: 'center center',
					onComplete: () => {
						gsap.set(dot, { clearProps: 'all' });
					}
				},
				0
			);
		}

		// Animation of the text :
		const span = el.querySelector('span');
		if (span) {
			tl.add(
				animations['reveal-letters'](span, {
					delay: 0.55,
					staggers: 0.0475
				}),
				0
			);
		}

		return tl;
	},

	'reveal-label-shuffle': (el, options) => {
		const tl = gsap.timeline({
			delay: options.delay || 0
		});

		tl.add(() => {
			// Trigger on the element itself (in case it IS the LabelShuffle) :
			el.dispatchEvent(new CustomEvent('label-shuffle-reveal', { bubbles: true }));

			// Also search for any LabelShuffle children if the directive is on a wrapper :
			el.querySelectorAll('.partials-label-shuffle').forEach((child) => {
				child.dispatchEvent(new CustomEvent('label-shuffle-reveal', { bubbles: false }));
			});
		}, 0.01);

		tl.to({}, { duration: 0.1 });

		return tl;
	},

	'reveal-chars': (el, options) => {
		const chars = el.querySelectorAll('.char');

		return gsap.from(chars, {
			x: '120%',
			duration: options.duration || 1.1,
			stagger: options.staggers || 0.075,
			ease: 'power4.out',
			delay: options.delay || 0,
			immediateRender: true,
			onComplete: () => {
				options.onComplete?.();
			}
		});
	},

	'reveal-letters': (el, options) => {
		const split = new SplitText(el, { type: 'words,chars', mask: 'chars', autoSplit: true });
		const chars = split.chars;

		return gsap.from(chars, {
			x: '120%',
			duration: 1.1,
			stagger: options.staggers || 0.075,
			ease: 'power4.out',
			delay: options.delay || 0,
			immediateRender: true,
			onComplete: () => {
				if (options.revert !== false) split.revert();
				options.onComplete?.();
			}
		});
	},

	'reveal-letters-speed': (el, options) => {
		const split = new SplitText(el, { type: 'words,chars', mask: 'chars', autoSplit: true });
		const chars = split.chars;

		const tween = gsap.from(chars, {
			x: options.direction === 'left' ? '-120%' : '120%',
			duration: 0.4,
			stagger: 0.03,
			ease: 'power2.out',
			delay: options.delay || 0,
			immediateRender: true,
			onStart: () => {
				options.onStart?.();
			},
			onComplete: () => {
				if (options.revert !== false) split.revert();
				options.onComplete?.();
			}
		});

		(tween as any).data = { split };
		return tween;
	},

	'hide-letters-speed': (el, options) => {
		const split = new SplitText(el, { type: 'words,chars', mask: 'chars', autoSplit: true });
		const chars = split.chars;

		const tween = gsap.to(chars, {
			x: options.direction === 'right' ? '120%' : '-120%',
			duration: 0.4,
			stagger: 0.03,
			ease: 'power2.out',
			delay: options.delay || 0,
			onStart: () => {
				options.onStart?.();
			},
			onComplete: () => {
				if (options.revert !== false) split.revert();
				options.onComplete?.();
			}
		});

		(tween as any).data = { split };
		return tween;
	},

	'reveal-paragraphs': (el, options) => {
		const originalHTML = el.innerHTML;
		el.innerHTML = originalHTML.replace(/<br\s*\/?>/gi, '\u200B<br>\u200B');

		const target = el.querySelector('p') || el;
		const split = new SplitText(target, { type: 'lines', mask: 'lines', autoSplit: true });
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

		const targets = el.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
		const splitTarget = targets.length > 0 ? Array.from(targets) : [el];

		const split = new SplitText(splitTarget, { type: 'lines', linesClass: 'line', tag: 'span' });
		split.lines.forEach((line) => {
			line.innerHTML = line.innerHTML.replace(/^[\s\u200B]+|[\s\u200B]+$/g, '');
		});
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
				duration: 0.525,
				ease: 'power2.inOut'
			});

			lineTl.set(line, { opacity: 1 });
			lineTl.set(block, { transformOrigin: 'right center' });

			lineTl.to(block, {
				scaleX: 0,
				duration: 0.525,
				ease: 'power2.inOut'
			});

			tl.add(lineTl, index * 0.125);
		});

		return tl;
	},

	'reveal-square': (el, options) => {
		const tl = gsap.timeline({
			delay: options.delay || 0
		});

		// Calculate starting inset based on origin :
		let startInset = 'inset(0% 100% 100% 0%)'; // default: Top-Left
		if (options.fromTopRight) startInset = 'inset(0% 0% 100% 100%)';
		if (options.fromBottomLeft) startInset = 'inset(100% 100% 0% 0%)';
		if (options.fromBottomRight) startInset = 'inset(100% 0% 0% 100%)';

		tl.from(el, {
			clipPath: startInset,
			duration: 1.2,
			ease: 'power3.inOut',
			immediateRender: true,
			onStart: () => {
				gsap.set(el, { transition: 'none', pointerEvents: 'none' });
			},
			onComplete: () => {
				gsap.set(el, { clearProps: 'all' });
			}
		});

		return tl;
	},

	'hide-square': (el, options) => {
		const tl = gsap.timeline({
			delay: options.delay || 0
		});

		tl.to(el, {
			clipPath: options.toTopRight ? 'inset(0% 0% 100% 100%)' : 'inset(100% 100% 0% 0%)',
			duration: 1.2,
			ease: 'power3.inOut',
			onStart: () => {
				gsap.set(el, { transition: 'none', pointerEvents: 'none' });
			},
			onComplete: () => {
				gsap.set(el, { clearProps: 'all' });
				options.onComplete?.();
			}
		});

		return tl;
	},

	'reveal-header-identity': (el, options) => {
		const tl = gsap.timeline({
			delay: options.delay || 0
		});

		tl.add(animations['reveal-square'](el, { ...options, fromBottomLeft: true }), 0);

		const span = el.querySelector('span');
		if (span) {
			tl.add(animations['reveal-letters'](span, { ...options, delay: (options.delay || 0) + 0.45 }), 0);
		}

		return tl;
	},

	'reveal-header-interactions': (el, options) => {
		const tl = gsap.timeline({
			delay: options.delay || 0
		});

		const contactLabel = el.querySelector('.label-contact');
		const menuIcon = el.querySelector('.menu-cta svg, .menu-cta .partials-icon-plus-minus');

		tl.add(animations['reveal-square'](el as HTMLElement, { fromBottomRight: true }), 0);

		if (menuIcon) {
			tl.add(animations['scale-up'](menuIcon as HTMLElement, { delay: 0.45, rotate: -90 }), 0);
		}

		if (contactLabel) {
			tl.add(animations['reveal-letters'](contactLabel as HTMLElement, { delay: 0.5 }), 0);
		}

		return tl;
	},

	'scale-down': (el, options) => {
		return gsap.to(el, {
			scale: 0.25,
			opacity: 0,
			rotate: options.rotate || 0,
			duration: options.duration || 0.8,
			ease: options.ease || 'power3.out',
			delay: options.delay || 0,
			onComplete: () => {
				if (options.reset) gsap.set(el, { clearProps: 'all' });
			}
		});
	},

	'scale-up': (el, options) => {
		return gsap.from(el, {
			scale: 0.25,
			opacity: 0,
			rotate: options.rotate || 0,
			duration: options.duration || 1.2,
			ease: options.ease || 'power3.out',
			delay: options.delay || 0,
			immediateRender: true,
			onStart: () => {
				gsap.set(el, { transition: 'none' });
			},
			onComplete: () => {
				if (options.reset) gsap.set(el, { clearProps: 'all' });
			}
		});
	},

	'scale-from-left': (el, options) => {
		return gsap.from(el, {
			scale: 0,
			duration: options.duration || 1.2,
			ease: 'power3.out',
			delay: options.delay || 0,
			immediateRender: true,
			transformOrigin: 'left center',
			onComplete: () => {
				if (options.reset) gsap.set(el, { clearProps: 'all' });
			}
		});
	}
};
