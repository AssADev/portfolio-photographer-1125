import { type AnchorHTMLAttributes } from 'vue';

import { t } from '#utils/i18n.ts';

export const getLinkAttributes = (
	link: { url?: string; target?: string; component?: string } | null | undefined,
	moreAttributes?: Partial<AnchorHTMLAttributes>
) => {
	if (!link?.url || typeof link.url !== 'string') return undefined;

	const attrs: Partial<Omit<AnchorHTMLAttributes, 'is' | 'type' | 'role'>> = { href: link.url, ...moreAttributes };

	if (link.target) Object.assign(attrs, { target: link.target, rel: 'noopener noreferrer' });
	if ('aria-label' in attrs && !isInternalLink(link.url)) {
		attrs['aria-label'] = attrs['aria-label'] + ', ' + t('linkNewWindow');
	}

	return attrs;
};

export const isInternalLink = (url: string) => url.startsWith('/');
