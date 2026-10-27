import type { ResolveData } from './resolveData';
import type { GetFromCacheFunction, TypeResolver } from './types';

export type ComponentResolver = {
	components: string[];
	condition?: (data: ResolveData) => boolean;
	resolveData?: (data: ResolveData, getFromCache: GetFromCacheFunction) => Promise<void>;
	// The resolver will throw when it's done, so that nothing is resolved afterwards :
	resolveTypes?: TypeResolver;
};

export const componentResolvers: Record<string, ComponentResolver> = {};
