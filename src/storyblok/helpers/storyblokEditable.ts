import { storyblokEditable as astroStoryblokEditable } from '@storyblok/astro';

const emptyEditable = () => ({}) as ReturnType<typeof astroStoryblokEditable>;

export const storyblokEditable = (blok: any, preview = false) =>
	(preview ? astroStoryblokEditable : emptyEditable)(blok);
