import { storyblokEditable as astroStoryblokEditable } from '@storyblok/astro';
import type { SbBlokData, StoryblokComponentType } from '@storyblok/astro';

const emptyEditable = () => ({}) as ReturnType<typeof astroStoryblokEditable>;

export const storyblokEditable = (blok: StoryblokComponentType<string> | undefined, preview = false) =>
	(preview ? astroStoryblokEditable : emptyEditable)(blok as SbBlokData);
