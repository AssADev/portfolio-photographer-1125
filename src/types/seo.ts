import type { HTMLAttributes } from 'astro/types';

export type LanguageAlternate = {
	hrefLang: string;
	href: URL | string;
};

export type OpenGraphArticleTagsType = {
	publishedTime?: string;
	modifiedTime?: string;
	expirationTime?: string;
	authors?: string[];
	section?: string;
	tags?: string[];
};

export type OpenGraphBasicTagsType = {
	title: string;
	type?: string;
	image?: string | null;
	url?: URL | string;
};

export type OpenGraphOptionalTagsType = {
	audio?: string;
	description?: string;
	determiner?: string;
	locale?: string;
	localeAlternate?: string[];
	siteName?: string;
	video?: string;
};

type TwitterCardType = 'summary' | 'summary_large_image' | 'app' | 'player';

export type TwitterTagsType = {
	card?: TwitterCardType;
	site?: string;
	creator?: string;
	title?: string;
	description?: string;
	image?: URL | string | null;
	imageAlt?: string;
};

type Link = HTMLAttributes<'link'>;
type Meta = HTMLMetaElement & {
	property: string;
};

export type ExtendedTagsType = {
	link?: Partial<Link>[];
	meta?: Partial<Meta>[];
};
