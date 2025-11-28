import { tabbable } from 'tabbable';

export const isDisplayNone = (el: Element | null) => !el || getComputedStyle(el).display === 'none';

const focusableSelectors = [
	'a[href]',
	'area[href]',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'button:not([disabled]):not([tabindex="-1"])',
	'iframe:not([tabindex="-1"])',
	'object:not([tabindex="-1"])',
	'embed:not([tabindex="-1"])',
	'[tabindex]:not([tabindex="-1"])',
	'[contenteditable="true"]:not([tabindex="-1"])',
	'audio[controls]:not([tabindex="-1"])',
	'video[controls]:not([tabindex="-1"])',
	'details summary:not([tabindex="-1"])'
].join(',');

export const setTabIndexNegative = (element: HTMLElement) => {
	// if element is itself focusable set tabindex -1
	if (element.matches(focusableSelectors)) {
		if (!element.hasAttribute('data-tabindex')) element.setAttribute('data-tabindex', '' + element.tabIndex || '0');
		element.tabIndex = -1;
	}

	const focusableElements = element.querySelectorAll<HTMLElement>(focusableSelectors);
	focusableElements.forEach((el) => {
		if (!el.hasAttribute('data-tabindex')) el.setAttribute('data-tabindex', '' + el.tabIndex || '0');
		el.tabIndex = -1;
	});
};

export const restoreTabIndex = (element: HTMLElement) => {
	const descendants = element.querySelectorAll<HTMLElement>('[data-tabindex],' + focusableSelectors);

	if (!descendants.length || element.hasAttribute('data-tabindex')) {
		element.tabIndex = ~~(element.getAttribute('data-tabindex') || 0);
		element.removeAttribute('data-tabindex');
	}

	descendants.forEach((el) => {
		if (el.hasAttribute('data-tabindex') || el.tabIndex !== -1) {
			el.tabIndex = ~~(element.getAttribute('data-tabindex') || 0);
			el.removeAttribute('data-tabindex');
		}
	});
};

export const getFirstTabbable = (element: HTMLElement | null) => {
	if (!element) return;
	return tabbable(element, { displayCheck: 'none', includeContainer: true })[0];
};
