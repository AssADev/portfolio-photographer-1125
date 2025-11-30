import { useResizeObserver } from '@vueuse/core';
import { ref } from 'vue';

export const useAnimateHeight = () => {
	const outerEl = ref<HTMLElement>();
	const innerEl = ref<HTMLElement>();

	useResizeObserver(
		innerEl,
		([entry]) => {
			const size = Math.ceil(entry.borderBoxSize[0].blockSize);
			// If (size) prevents display none issues :
			if (size && outerEl.value) outerEl.value.style.height = size + 'px';
		},
		{ box: 'border-box' }
	);

	return [innerEl, outerEl];
};
