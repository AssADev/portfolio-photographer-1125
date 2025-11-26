import { VideoRegex } from '#utils/assets.ts';

import { localizeLink } from '#storyblok/helpers/localizeLink.ts';

import type { ResolveData } from './resolveData';
import { type TypeResolver, arrayToElementType } from './types';

const isRichTextEmpty = (data: any) => {
	return !data || (data?.content?.[0].type !== 'blok' && !data?.content?.[0].content);
};

export type FieldResolver = {
	resolveTypes?: TypeResolver;
} & (
	| {
			condition: (data: ResolveData) => boolean;
			resolveFields: (data: ResolveData, cache: Record<string, any>) => void | Promise<void>;
	  }
	| { condition?: never; resolveFields?: never }
);

export const fieldResolvers: Record<string, FieldResolver> = {
	seo: {
		condition: ({ content }) => Array.isArray(content.seo),
		async resolveFields({ content }) {
			content.seo = content.seo?.[0];
		},
		resolveTypes: {
			changeFields: [{ name: 'seo', type: arrayToElementType }]
		}
	},
	multilink: {
		condition: ({ content }) => content.fieldtype === 'multilink',
		resolveFields({ content, language }) {
			// Process multilinks (localize links) :
			localizeLink(content as any, language);
		},
		resolveTypes: {
			interfaces: ['StoryblokMultilink'],
			addFields: [
				{ name: 'name', type: 'string', hasQuestionToken: true },
				{ name: 'component', type: 'string', hasQuestionToken: true }
			]
		}
	},
	// Clearing rich text when empty :
	richText: {
		condition: ({ content }) => content.type === 'doc',
		async resolveFields({ content }) {
			if (isRichTextEmpty(content as any)) content.content = null;
		}
	},
	altImage: {
		condition: ({ content }) => content.alt && content.fieldtype === 'asset',
		async resolveFields({ content }) {
			content.alt = content.meta_data.alt || content.alt;
		}
	},
	filenameImage: {
		condition: ({ content }) =>
			typeof content.filename === 'string' && !content.is_external_url && content.filename.startsWith('http'),
		async resolveFields({ content }) {
			// Import transformAssetSrc at runtime as it uses Astro's env variables
			const { transformAssetSrc } = await import('#storyblok/helpers/transformAssetSrc.ts');
			// Process image URLs - only transform 'filename' property
			content.filename = transformAssetSrc(content.filename);
			if (VideoRegex.test(content.filename)) content.assetType = 'video';
		}
	},
	asset: {
		resolveTypes: {
			interfaces: ['StoryblokAsset'],
			addFields: [
				{ name: 'poster', type: 'StoryblokAsset | string | null', hasQuestionToken: true },
				{ name: 'vimeoId', type: 'string', hasQuestionToken: true },
				{ name: 'assetType', type: "'video' | null", hasQuestionToken: true }
			]
		}
	}
};
