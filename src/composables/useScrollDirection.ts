import { onMounted, onUnmounted, ref } from 'vue';

/**
 * Composable for tracking scroll direction (up/down)
 *
 * @returns An object containing the current scroll direction
 */
export const useScrollDirection = () => {
	const scrollDirection = ref<'up' | 'down'>('down');
	let lastScrollY = 0;

	/**
	 * Updates the scroll direction based on the current scroll position
	 */
	function updateScrollDirection() {
		const currentScrollY = window.scrollY;

		if (currentScrollY !== lastScrollY) {
			scrollDirection.value = currentScrollY > lastScrollY ? 'down' : 'up';
			lastScrollY = currentScrollY;
		}
	}

	onMounted(() => {
		lastScrollY = window.scrollY;
		window.addEventListener('scroll', updateScrollDirection);
	});

	onUnmounted(() => {
		window.removeEventListener('scroll', updateScrollDirection);
	});

	return {
		scrollDirection
	};
};
