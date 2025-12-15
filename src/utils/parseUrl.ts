import locales from './locales.json';

export default function parseUrl(url?: string) {
	// Converting the current url to an array based on '/' :
	const urlToArray = url?.split('/').filter(Boolean);

	// Checking if current url contains a known language :
	const isKnownLang = locales.some((l) => l === urlToArray?.[0]);

	// Setting current language based on above :
	const currentLang = url && isKnownLang ? urlToArray![0] : locales[0];

	// Removing language from the url and only keeping the slug :
	const slug = url ? (isKnownLang ? urlToArray?.slice(1)?.join('/') || undefined : urlToArray?.join('/')) : undefined;

	return { language: currentLang, slug };
}
