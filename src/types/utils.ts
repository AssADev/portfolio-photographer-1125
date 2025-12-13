import type { Component, Ref, ShallowRef } from 'vue';

import type {
	StoryblokBiography,
	StoryblokHome,
	StoryblokLinks,
	StoryblokProject,
	StoryblokService,
	StoryblokServices
} from './component-types-sb';

export type DatasourceEntry = {
	dimension_value: string;
	value: string;
	name: string;
};

export type PageContentTypes =
	| StoryblokBiography
	| StoryblokHome
	| StoryblokLinks
	| StoryblokProject
	| StoryblokService
	| StoryblokServices;

export type RefOrComponentRef = Ref<HTMLElement | undefined> | Readonly<ShallowRef<HTMLElement | Component | null>>;
