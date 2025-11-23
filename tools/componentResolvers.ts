import type { ISbStoryData } from '@storyblok/js';

import type { ResolveData } from './resolveData';
import { type GetFromCacheFunction, type TypeResolver, arrayToElementType } from './types';

const getAppError = async () => {
	const { AppError } = await import('#lib/AppError.ts');
	return AppError;
};

/**
 * Takes a Storyblok story and a list of content keys, and returns an object
 * with the story's uuid, id, name, and the specified content keys.
 * @param story
 * @param contentKeys
 * @returns
 */
const storyToAttribute = <T>(story: ISbStoryData<T>, contentKeys: (keyof T)[]) => {
	const { uuid, id, name, content } = story;

	const filteredContent = contentKeys.reduce((acc, key) => {
		acc[key] = content[key];
		return acc;
	}, {} as Partial<T>);

	return Object.assign({ uuid, id, name }, filteredContent);
};

export type ComponentResolver = {
	components: string[];
	condition?: (data: ResolveData) => boolean;
	resolveData?: (data: ResolveData, getFromCache: GetFromCacheFunction) => Promise<void>;
	// The resolver will throw when it's done, so that nothing is resolved afterwards :
	resolveTypes?: TypeResolver;
};

export const componentResolvers: Record<string, ComponentResolver> = {};
