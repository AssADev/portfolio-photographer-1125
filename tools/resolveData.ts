import type { ISbStoryData } from '@storyblok/js';

import type { StoryblokSiteConfig } from '#types/component-types-sb.js';

import { componentResolvers } from './componentResolvers';
import { fieldResolvers as fieldResolversObject } from './fieldResolvers';
import type { GetFromCacheFunction } from './types';

const dataResolvers = Object.values(componentResolvers).filter((resolver) => resolver.resolveData);
const fieldResolvers = Object.values(fieldResolversObject).filter((resolver) => resolver.resolveFields);

export type ResolveData = {
	content: Record<string, any>;
	language: string;
	siteConfig: StoryblokSiteConfig;
	rootStory: ISbStoryData<Record<string, any>>;
	preview: boolean;
};

const resolveFields = async (data: ResolveData, getFromCache: GetFromCacheFunction) => {
	for (const resolver of fieldResolvers) {
		if (resolver.condition!(data)) {
			await resolver.resolveFields!(data, getFromCache);
		}
	}
};

const resolveComponents = async (data: ResolveData, getFromCache: GetFromCacheFunction) => {
	const { content } = data;
	if (!content.component) return [];

	for (const resolver of dataResolvers) {
		if (resolver.components.includes(content.component)) {
			if (!resolver.condition || resolver.condition(data)) {
				await resolver.resolveData!(data, getFromCache);
			}

			// Remove fields from the content
			if (resolver.resolveTypes?.removeFields) {
				resolver.resolveTypes?.removeFields.forEach((field) => {
					if (typeof field === 'string') delete content[field];
					else {
						for (const variableKey in content) {
							// delete all keys matching regexp
							// eslint-disable-next-line no-prototype-builtins
							if (content.hasOwnProperty(variableKey) && field.test(variableKey))
								delete content[variableKey];
						}
					}
				});
			}
		}
	}
};

export const resolveContent = async (data: ResolveData) => {
	const cache: Record<string, any> = {};

	async function getFromCache<T>(key: string, cb: () => Promise<T>) {
		if (key in cache) return cache[key as keyof typeof cache] as T;
		const result = await cb();
		cache[key] = result;

		return result;
	}

	// resolve fields
	await resolveFields(data, getFromCache);
	// resolve components
	await resolveComponents(data, getFromCache);
};
