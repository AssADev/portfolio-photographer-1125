import { type MaybeRefOrGetter, ref, toValue, watch } from 'vue';

export const useDeferredLoading = (
	watcher: MaybeRefOrGetter,
	{ delayBeforeLoad = 100, loadDuration = 1000, delayAfterLoad = 0 } = {}
) => {
	let timeoutLoading: number;
	let timestamp: number;

	const loading = ref(toValue(watcher));

	if (typeof window !== 'undefined') {
		watch(
			() => toValue(watcher),
			(isLoading, _, onCleanup) => {
				clearTimeout(timeoutLoading);
				// Show loading after 100ms to avoid flickering :
				if (isLoading) {
					timeoutLoading = window.setTimeout(() => {
						timestamp = Date.now();
						loading.value = true;
					}, delayBeforeLoad);
				} else {
					// Show loading for at least some time if it has been shown before :
					if (loading.value) {
						timeoutLoading = window.setTimeout(
							() => {
								loading.value = false;
							},
							Math.max(delayAfterLoad, loadDuration - (Date.now() - timestamp))
						);
					}
				}
				onCleanup(() => {
					clearTimeout(timeoutLoading);
				});
			},
			{ immediate: true }
		);
	}

	return loading;
};
