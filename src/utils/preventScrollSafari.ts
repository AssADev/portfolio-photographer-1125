/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
function chain(...callbacks: any[]): (...args: any[]) => void {
	return (...args: any[]) => {
		for (const callback of callbacks) {
			if (typeof callback === 'function') {
				callback(...args);
			}
		}
	};
}

function isScrollable(node: Element | null, checkForOverflow?: boolean): boolean {
	if (!node) {
		return false;
	}
	const style = window.getComputedStyle(node);
	let isScrollable = /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY);

	if (isScrollable && checkForOverflow) {
		isScrollable = node.scrollHeight !== node.clientHeight || node.scrollWidth !== node.clientWidth;
	}

	return isScrollable;
}

function getScrollParent(node: Element, checkForOverflow?: boolean): Element {
	let scrollableNode: Element | null = node;
	if (isScrollable(scrollableNode, checkForOverflow)) {
		scrollableNode = scrollableNode.parentElement;
	}

	while (scrollableNode && !isScrollable(scrollableNode, checkForOverflow)) {
		scrollableNode = scrollableNode.parentElement;
	}

	return scrollableNode || document.scrollingElement || document.documentElement;
}

// Mobile Safari is a whole different beast. Even with overflow: hidden,
// it still scrolls the page in many situations:
//
// 1. When the bottom toolbar and address bar are collapsed, page scrolling is always allowed.
// 2. When the keyboard is visible, the viewport does not resize. Instead, the keyboard covers part of
//    it, so it becomes scrollable.
// 3. When tapping on an input, the page always scrolls so that the input is centered in the visual viewport.
//    This may cause even fixed position elements to scroll off the screen.
// 4. When using the next/previous buttons in the keyboard to navigate between inputs, the whole page always
//    scrolls, even if the input is inside a nested scrollable element that could be scrolled instead.
//
// In order to work around these cases, and prevent scrolling without jankiness, we do a few things:
//
// 1. Prevent default on `touchmove` events that are not in a scrollable element. This prevents touch scrolling
//    on the window.
// 2. Set `overscroll-behavior: contain` on nested scrollable regions so they do not scroll the page when at
//    the top or bottom. Work around a bug where this does not work when the element does not actually overflow
//    by preventing default in a `touchmove` event. This is best effort: we can't prevent default when pinch
//    zooming or when an element contains text selection, which may allow scrolling in some cases.
// 3. Prevent default on `touchend` events on input elements and handle focusing the element ourselves.
// 4. When focus moves to an input, create an off screen input and focus that temporarily. This prevents
//    Safari from scrolling the page. After a small delay, focus the real input and scroll it into view
//    ourselves, without scrolling the whole page.
export function preventScrollMobileSafari() {
	let scrollable: Element;
	const onTouchStart = (e: TouchEvent) => {
		// Store the nearest scrollable parent element from the element that the user touched.
		const target = e.target as Element;
		scrollable = isScrollable(target) ? target : getScrollParent(target, true);
	};

	// Prevent scrolling up when at the top and scrolling down when at the bottom
	// of a nested scrollable area, otherwise mobile Safari will start scrolling
	// the window instead.
	// This must be applied before the touchstart event as of iOS 26, so inject it as a <style> element.
	const style = document.createElement('style');
	style.textContent = `
@layer {
  * {
    overscroll-behavior: contain;
  }
}`.trim();
	document.head.prepend(style);

	const onTouchMove = (e: TouchEvent) => {
		// Allow pinch-zooming.
		if (e.touches.length === 2) {
			return;
		}

		// Prevent scrolling the window.
		if (!scrollable || scrollable === document.documentElement || scrollable === document.body) {
			e.preventDefault();
			return;
		}

		// overscroll-behavior should prevent scroll chaining, but currently does not
		// if the element doesn't actually overflow. https://bugs.webkit.org/show_bug.cgi?id=243452
		// This checks that both the width and height do not overflow, otherwise we might
		// block horizontal scrolling too. In that case, adding `touch-action: pan-x` to
		// the element will prevent vertical page scrolling. We can't add that automatically
		// because it must be set before the touchstart event.
		if (scrollable.scrollHeight === scrollable.clientHeight && scrollable.scrollWidth === scrollable.clientWidth) {
			e.preventDefault();
		}
	};

	const removeEvents = chain(
		addEvent(document, 'touchstart', onTouchStart, { passive: false, capture: true }),
		addEvent(document, 'touchmove', onTouchMove, { passive: false, capture: true })
	);

	return () => {
		removeEvents();
		style.remove();
		HTMLElement.prototype.focus = focus;
	};
}

// Adds an event listener to an element, and returns a function to remove it.
function addEvent<K extends keyof GlobalEventHandlersEventMap>(
	target: Document | Window,
	event: K,
	handler: (this: Document | Window, ev: GlobalEventHandlersEventMap[K]) => any,
	options?: boolean | AddEventListenerOptions
) {
	// @ts-expect-error internal function, so it's ok to ignore the difficult to fix type error
	target.addEventListener(event, handler, options);
	return () => {
		// @ts-expect-error same
		target.removeEventListener(event, handler, options);
	};
}
