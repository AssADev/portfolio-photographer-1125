// Stolen from https://github.com/jimmywarting/groupby-polyfill/blob/main/lib/polyfill.js
export function groupBy<T, K extends symbol | number | string>(iterable: Iterable<T>, cb: (t: T, index: number) => K) {
	const obj = Object.create(null);
	let i = 0;
	for (const value of iterable) {
		const key = cb(value, i++);
		key in obj ? obj[key].push(value) : (obj[key] = [value]);
	}
	return obj as Record<string, T[]>;
}

// Safe array.at() function that uses native implementation or fallback :
export function arrayAt<T>(array: T[], index: number): T | undefined {
	if (typeof Array.prototype.at === 'function') {
		return array.at(index);
	} else {
		// Fallback implementation :
		const len = array.length;
		const relativeIndex = index < 0 ? len + index : index;

		// Return undefined if index is out of bounds :
		if (relativeIndex < 0 || relativeIndex >= len) {
			return undefined;
		}

		return array[relativeIndex];
	}
}

export function applyHasOwn() {
	// Polyfill for Object.hasOwn() for older browser support :
	if (!Object.hasOwn) {
		Object.hasOwn = function (obj: object, prop: string | number | symbol): boolean {
			return Object.prototype.hasOwnProperty.call(obj, prop);
		};
	}
}
