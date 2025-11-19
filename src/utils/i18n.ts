import { getState } from '#utils/astro-state.ts';
import locales from '#utils/locales.json';
import { arrayAt } from '#utils/polyfills.ts';

const translations = Object.fromEntries(
	Object.entries(
		import.meta.glob<true, string, Record<string, string>>('../assets/locales/*.json', {
			eager: true,
			import: 'default'
		})
	).map(([path, locale]) => [path.split('/').pop()!.replace('.json', ''), locale])
);

const missingLocales = new Set<string>();

export const getLocale = () =>
	import.meta.env.SSR
		? (getState('language', locales[0]) as string)
		: arrayAt(document.documentElement.lang.split('-'), 0)!;

export function t(key: string, mapping: Record<string, any> = {}, language = getLocale()) {
	const translation = Object.entries(mapping).reduce(
		(acc, [_key, value]) => acc.replace(`{${_key}}`, value),
		translations[language][key]?.replaceAll('\\n', '\n') || key
	);

	if (!import.meta.env.SSR && translation === key && !missingLocales.has(key)) {
		missingLocales.add(key);
		console.warn(`Missing translation for key ${key} in language ${language}`, missingLocales);
	}

	return translation;
}
