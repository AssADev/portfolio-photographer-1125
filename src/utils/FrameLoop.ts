/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import gsap from 'gsap';

export class FrameLoop {
	rafId = 0;
	queue = new Set<Function>();
	running = false;
	time = {
		start: 0,
		delta: 0,
		elapsed: 0
	};
	onDemand = false;

	tick: gsap.TickerCallback = (_time, delta) => {
		if (!this.running) return;

		this.time.delta = delta;
		this.time.elapsed += this.time.delta;
		this.queue.forEach((cb) => cb());
	};

	run = () => {
		if (!this.running) {
			this.time = { start: gsap.ticker?.time * 1000, elapsed: 0, delta: 0 };
			this.running = true;

			if (!this.onDemand) gsap.ticker?.add(this.tick);
		}
	};

	start = (cb: Function) => {
		this.queue.add(cb);
		this.run();
	};

	stop = (cb: Function) => {
		if (!cb) {
			return;
		}
		this.queue.delete(cb);
		if (!this.queue.size) {
			this.stopAll();
		}
	};

	stopAll = () => {
		gsap.ticker?.remove(this.tick);

		this.running = false;
	};
}

export const Loop = new FrameLoop();
