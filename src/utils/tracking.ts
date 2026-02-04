import locales from '#utils/locales.json';
import { arrayAt } from '#utils/polyfills.ts';

// --- Types ---

type CommonEvent = {
	languageCode: typeof LANGUAGE_CODE;
	pageType: string;
	pageName: string;
};

type PageViewEvent = CommonEvent & {
	event: 'virtualPageView';
};

type NavigationClickEvent = CommonEvent & {
	event: 'navigationClick';
	buttonText: string;
	destination: string;
	componentName: string;
};

type NavigationClickParams = {
	buttonText?: string;
	destination?: string;
	componentName?: string;
};

type FormOpenClickEvent = CommonEvent & {
	event: 'formOpenClick';
	buttonText: string;
	formId: string;
	componentName: string;
};

type FormOpenClickParams = {
	buttonText?: string;
	formId?: string;
	componentName?: string;
};

const isBrowser = typeof window !== 'undefined';
const LANGUAGE_CODE = isBrowser ? arrayAt(document.documentElement.lang.split('-'), 0)! : locales[0];

// --- Helpers ---
function pushToDataLayer(
	event:
		| PageViewEvent
		| NavigationClickEvent
		| FormOpenClickEvent
		| CommonEvent
		| { 'gtm.start': number; event: 'gtm.js' }
) {
	if (isBrowser) {
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push(event);
	}
}

export function initTracking() {
	const { pageType, pageName } = getProps();

	const event: CommonEvent = {
		languageCode: LANGUAGE_CODE,
		pageType,
		pageName
	};
	pushToDataLayer(event);
	pushToDataLayer({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
}

// --- Tracking Functions ---
export function trackPageView() {
	const { pageType, pageName } = getProps();

	const event: PageViewEvent = {
		event: 'virtualPageView',
		languageCode: LANGUAGE_CODE,
		pageType,
		pageName
	};
	pushToDataLayer(event);
}

export function trackNavigationClick(e: MouseEvent, params?: NavigationClickParams) {
	const eventTarget = e.currentTarget as HTMLElement;
	const targetElement = eventTarget.closest<HTMLAnchorElement | HTMLButtonElement>('a, button');

	const buttonText = params?.buttonText || targetElement?.textContent || targetElement?.ariaLabel || '';
	const destination = params?.destination || (targetElement instanceof HTMLAnchorElement ? targetElement.href : '');

	const { pageName, componentName, pageType } = getProps(targetElement);

	const event: NavigationClickEvent = {
		event: 'navigationClick',
		languageCode: LANGUAGE_CODE,
		pageType,
		buttonText: buttonText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim(),
		destination,
		componentName,
		pageName
	};

	pushToDataLayer(event);
}

export function trackFormOpenClick(e: MouseEvent, params?: FormOpenClickParams) {
	const eventTarget = e.currentTarget as HTMLElement;
	const targetElement = eventTarget.closest<HTMLAnchorElement | HTMLButtonElement>('a, button');

	const buttonText = params?.buttonText || targetElement?.textContent || targetElement?.ariaLabel || '';
	const formId = params?.formId || (targetElement instanceof HTMLAnchorElement ? targetElement.href : '');

	const { pageName, componentName, pageType } = getProps(targetElement);

	const event: FormOpenClickEvent = {
		event: 'formOpenClick',
		languageCode: LANGUAGE_CODE,
		pageType,
		buttonText: buttonText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim(),
		formId,
		componentName,
		pageName
	};

	pushToDataLayer(event);
}

function getProps(element?: HTMLElement | null) {
	const pageType = document.documentElement.dataset.pageType!;
	const componentName = element?.closest<HTMLElement>('[data-component-name]')?.dataset.componentName || '';

	let pageName = pageType;
	if (componentName) pageName += `-${componentName}`;

	return { pageName, componentName, pageType };
}
