import type { Arrayable, MaybeComputedElementRef } from '@vueuse/core';
import { type UseFocusTrapOptions, useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { type MaybeRefOrGetter, type Ref, nextTick, watch } from 'vue';

/**
 * Helper to the @vueuse/integrations useFocusTrap that adds the `model` prop
 * to the options. When used, it will automatically add immediate and onDeactivate
 * to the options to set the model to false when the trap is deactivated.
 */
export const useTrap = (
	target: Arrayable<MaybeRefOrGetter<string> | MaybeComputedElementRef>,
	options: UseFocusTrapOptions & { model?: Ref<boolean> } = {}
) => {
	const moreOptions: UseFocusTrapOptions = {};
	const { clickOutsideDeactivates, ...restOptions } = options;

	if (options?.model) {
		moreOptions.onDeactivate = () => {
			options.onDeactivate?.();
			if (options.model) options.model.value = false;
		};

		moreOptions.immediate = options.model.value;
	}

	const trap = useFocusTrap(target, {
		preventScroll: true,
		allowOutsideClick: (event: { type: string }) => {
			if (clickOutsideDeactivates) {
				if (event.type === 'click') {
					trap.deactivate();
					if (options?.model) options.model.value = false;
					return false;
				}
				return true;
			}
			return false;
		},
		// Silence focus trap errors :
		tabbableOptions: { displayCheck: 'none' },
		...restOptions,
		...moreOptions
	});

	if (options?.model) {
		watch(options.model, async (value) => {
			if (value) {
				await nextTick();
				if (options.model?.value) trap.activate();
			} else {
				trap.deactivate();
			}
		});
	}

	return trap;
};
