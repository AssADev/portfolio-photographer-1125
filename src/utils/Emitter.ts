export class Emitter<T = any[]> {
	#listeners = new Map<string, Set<(...a: T[]) => void>>();
	on = (event: string, cb: (...a: T[]) => void) => {
		if (this.#listeners.has(event)) {
			this.#listeners.get(event)!.add(cb);
		} else {
			this.#listeners.set(event, new Set([cb]));
		}
	};
	off = (event: string, cb: (...a: T[]) => void) => {
		if (this.#listeners.has(event)) {
			this.#listeners.get(event)!.delete(cb);
		}
	};
	emit = (event: string, ...rest: T[]) => {
		if (this.#listeners.has(event)) {
			this.#listeners.get(event)!.forEach((cb) => cb(...rest));
		}
	};
	clean() {
		this.#listeners.clear();
	}
}
