import { atom } from 'nanostores';

export const $currentFilter = atom<string>('allMyProjects');

export const setCurrentFilter = (filter: string) => {
	$currentFilter.set(filter);
};
