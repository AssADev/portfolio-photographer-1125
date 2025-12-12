let _isTouchDevice: boolean;

export const isTouchDevice = () => {
	if (_isTouchDevice !== undefined) return _isTouchDevice;

	_isTouchDevice = !!(
		window.matchMedia('(pointer: coarse)').matches ||
		typeof window.ontouchstart === 'function' ||
		navigator.maxTouchPoints > 0 ||
		// @ts-expect-error - non-standard property
		navigator.msMaxTouchPoints > 0
	);

	return _isTouchDevice;
};
