/**
 * Informations about the business, used by the structured data (local SEO) and some SEO fallbacks.
 * They could be moved to the Storyblok site config to be editable from the CMS.
 */
export const business = {
	// Cities where the sessions take place (as mentioned in the titles & descriptions of the site) :
	areaServed: ['Metz', 'Nancy'],
	region: 'Grand Est',
	country: 'FR',
	currency: 'EUR',
	/**
	 * URL of the Google Business Profile (e.g. https://maps.app.goo.gl/...), highly recommended for the local SEO.
	 * It's added to the `sameAs` of the structured data.
	 */
	googleBusinessProfile: undefined as string | undefined
};
