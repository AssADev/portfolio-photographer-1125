import { map } from 'nanostores';

export type GlobalStore = {
	lockScroll: boolean;
	headerTheme: 'light' | 'dark';
	isContactToggled: boolean;
	contactFormId?: string;
};

export const $global = map<GlobalStore>({
	lockScroll: false,
	headerTheme: 'light',
	isContactToggled: false,
	contactFormId: undefined
});
