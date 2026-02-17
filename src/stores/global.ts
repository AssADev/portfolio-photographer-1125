import { map } from 'nanostores';

export type GlobalStore = {
	lockScroll: boolean;
	headerTheme: 'light' | 'dark';
	isContactToggled: boolean;
	isMenuToggled: boolean;
	contactFormId?: string;
	isHeaderAnimating: boolean;
};

export const $global = map<GlobalStore>({
	lockScroll: false,
	headerTheme: 'light',
	isContactToggled: false,
	isMenuToggled: false,
	isHeaderAnimating: false,
	contactFormId: undefined
});
