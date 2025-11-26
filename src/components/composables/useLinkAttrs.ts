import { type MaybeRefOrGetter, computed, toRef } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';

type LinkType = Parameters<typeof getLinkAttributes>[0];
type AttributeTypes = Parameters<typeof getLinkAttributes>[1];

export const useLinkAttrs = (link: MaybeRefOrGetter<LinkType>, moreAttributes?: AttributeTypes) => {
	const _link = toRef(link);
	return computed(() => getLinkAttributes(_link.value, moreAttributes));
};
