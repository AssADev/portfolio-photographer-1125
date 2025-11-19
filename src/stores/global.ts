import { map } from 'nanostores';

export type GlobalStore = {
	lockScroll: boolean;
	headerTheme: 'light' | 'dark';
};

export const $global = map<GlobalStore>({
	lockScroll: false,
	headerTheme: 'light'
});
