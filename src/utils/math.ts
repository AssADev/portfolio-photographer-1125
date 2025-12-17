/**
 * Clamps a value between a minimum and maximum value.
 *
 * @param value The value to clamp.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The clamped value.
 */
export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

/**
 * Performs linear interpolation between two values.
 *
 * @param curr The current value.
 * @param dest The destination value.
 * @param factor The factor to interpolate by, between 0 and 1.
 * @returns The interpolated value.
 */
export const lerp = (curr: number, dest: number, factor: number): number => curr + (dest - curr) * factor;

/**
 * Delays a curve by a given factor.
 *
 * @param value The value of the curve to delay.
 * @param offset The factor to delay the curve by.
 * @returns The delayed value of the curve.
 */
export const delay = (value: number, offset: number) => clamp(value * (1 + offset) - offset, 0, 1);

export const vectorLength = (x: number, y: number) => Math.hypot(x, y);

export const interpolate = (min: number, max: number, ratio: number) => min + ratio * (max - min);

export const findClosestIndex = (target: number, steps: number[], sorted = false, reverse = false) => {
	if (steps.length === 0) {
		return -1; // Handle empty array case
	}

	const initialIndex = reverse ? steps.length - 1 : 0;
	let closestDifference = Math.abs(target - steps[initialIndex]);

	let closestIndex = reverse ? steps.length - 1 : 0;

	for (let i = 0; i < steps.length; i++) {
		const normalizedIndex = reverse ? steps.length - 1 - i : i;
		const difference = Math.abs(target - steps[normalizedIndex]);

		if (difference <= closestDifference) {
			closestIndex = normalizedIndex;
			closestDifference = difference;
		} else {
			// Early exit if the difference starts increasing
			if (sorted) break;
		}
	}

	return closestIndex;
};

const rubberband = (distance: number, dimension: number, constant: number) => {
	if (dimension === 0 || Math.abs(dimension) === Number.POSITIVE_INFINITY) {
		return distance ** (constant * 5);
	}
	return (distance * dimension * constant) / (dimension + constant * distance);
};

export const rubberbandIfOutOfBounds = (position: number, min: number, max: number, constant = 0.15) => {
	if (constant === 0) {
		return clamp(position, min, max);
	}
	if (position < min) {
		return -rubberband(min - position, max - min, constant) + min;
	}
	if (position > max) {
		return +rubberband(position - max, max - min, constant) + max;
	}
	return position;
};

// Function to get overlapping ratio between two intervals
export const getOverlappingRatio = ([start, end]: [number, number], [refStart, refEnd]: [number, number]) => {
	// Calculate the overlap with reference interval
	const overlapStart = Math.max(start, refStart);
	const overlapEnd = Math.min(end, refEnd);
	const overlapLength = Math.max(0, overlapEnd - overlapStart);

	// Calculate the total length of the test interval
	const intervalLength = end - start;

	return overlapLength / intervalLength;
};

export const groupItems = <T>(items: T[], groupSize: number) => {
	return Array.from({ length: Math.ceil(items.length / groupSize) }, (_, i) =>
		items.slice(i * groupSize, i * groupSize + groupSize)
	);
};
