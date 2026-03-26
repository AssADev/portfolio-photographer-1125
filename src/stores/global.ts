import { map } from 'nanostores';

export type GlobalStore = {
	lockScroll: boolean;
	headerTheme: 'light' | 'dark';
	isContactToggled: boolean;
	isMenuToggled: boolean;
	isHeaderAnimating: boolean;
	isContactFormActive: boolean;
	contactFormId?: string;
	isSiteLoaded: boolean;
};

export const $global = map<GlobalStore>({
	lockScroll: false,
	headerTheme: 'light',
	isContactToggled: false,
	isMenuToggled: false,
	isHeaderAnimating: false,
	isContactFormActive: false,
	contactFormId: undefined,
	isSiteLoaded: false
});
