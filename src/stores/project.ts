import { map } from 'nanostores';

export type ProjectMinimapStore = {
	isOpen: boolean;
	isFlipping: boolean;
	initialIndex: number;
	currentIndex: number;
	clickedElement: HTMLElement | null;
	clickedParentElement: HTMLElement | null;
};

export const $projectMinimap = map<ProjectMinimapStore>({
	isOpen: false,
	isFlipping: false,
	initialIndex: 0,
	currentIndex: 0,
	clickedElement: null,
	clickedParentElement: null
});

export const openMinimap = (index: number, element: HTMLElement) => {
	if ($projectMinimap.value.isFlipping) return;

	$projectMinimap.set({
		isOpen: true,
		isFlipping: true,
		initialIndex: index,
		currentIndex: index,
		clickedElement: element,
		clickedParentElement: element.parentElement
	});
};

export const closeMinimap = () => {
	$projectMinimap.setKey('isOpen', false);
};
