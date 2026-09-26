<script setup lang="ts">
import { StoryblokRichText, type StoryblokRichTextNode } from '@storyblok/vue';
import { type VNode, computed, h, useTemplateRef } from 'vue';

import LabelShuffle from '#components/partials/LabelShuffle.vue';

import type { StoryblokRichtext } from '#types/component-types-sb.js';

import { useRouter } from '#composables/useRouter.ts';
import { $global } from '#stores/global.ts';

// Props :
const {
	doc,
	resolvers,
	shuffle = false,
	noSnap = false,
	reveal = false,
	prefix = '',
	speed = 'fast',
	tag = 'div'
} = defineProps<{
	doc: StoryblokRichtext;
	resolvers?: Record<string, (node: StoryblokRichTextNode<VNode>) => VNode>;
	shuffle?: boolean;
	noSnap?: boolean;
	reveal?: boolean;
	prefix?: string;
	speed?: 'normal' | 'fast';
	tag?: string;
}>();

// Refs :
const el = useTemplateRef('el');

// Router :
const { location } = useRouter();

// Computed :
const plaintext = computed(() => {
	if (!shuffle || !doc) return '';

	const extractText = (node: StoryblokRichtext): string => {
		if (node.text) return node.text;
		if (node.content && Array.isArray(node.content)) {
			return node.content.map(extractText).join('');
		}
		return '';
	};

	return extractText(doc);
});

// Resolvers (RichText) :
// Storyblok expects a flat map of resolvers keyed by node/mark type.
// For marks, the already rendered content is given in `node.text` (not `node.children`).
const markResolvers = {
	textStyle: (node: StoryblokRichTextNode<VNode>) => {
		const color = node.attrs?.color?.trim();

		return h('span', color ? { style: { color } } : {}, node.text);
	},
	link: (node: StoryblokRichTextNode<VNode>) => {
		const { href: rawHref = '', anchor, linktype, target, story } = node.attrs || {};

		// Same href resolution as the default Storyblok link resolver :
		let href = linktype === 'email' ? `mailto:${rawHref}` : rawHref;
		if (linktype === 'story' && anchor) href = `${href}#${anchor}`;

		const currentPath = location.value.pathname.replace(/\/$/, '') || '/';
		let targetPath = href;
		let isInternal = !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('mailto:');

		if (!isInternal) {
			try {
				const url = new URL(href, location.value.origin);
				if (url.origin === location.value.origin) {
					targetPath = url.pathname;
					isInternal = true;
				}
			} catch (e) {
				console.error(e);
			}
		}

		targetPath = targetPath.replace(/\/$/, '') || '/';

		const isCurrentPage = isInternal && currentPath === targetPath;
		const isForm =
			isInternal &&
			(story?.content?.component === 'Forms' || targetPath.includes('/forms/') || targetPath.endsWith('/forms'));

		const linkTarget = isForm ? undefined : target || undefined;

		return h(
			'a',
			{
				href: href,
				target: linkTarget,
				rel: linkTarget === '_blank' ? 'noopener noreferrer' : undefined,
				onClick: (e: MouseEvent) => {
					if (isCurrentPage) {
						e.preventDefault();
						return;
					}

					if (isForm) {
						e.preventDefault();
						$global.setKey('isContactToggled', true);

						const formId = story?.content?.id;
						if (formId) {
							$global.setKey('contactFormId', formId);
						} else {
							const parts = targetPath.split('/');
							const formsIndex = parts.indexOf('forms');
							if (formsIndex !== -1 && parts[formsIndex + 1]) {
								$global.setKey('contactFormId', parts[formsIndex + 1]);
							}
						}
					}
				}
			},
			node.text
		);
	}
};

// The default `text` resolver must be kept, as it is the one applying the marks (bold, italic, links...) :
const mergedResolvers = {
	...markResolvers,
	...resolvers
};

// Expose :
defineExpose({ el });
</script>

<template>
	<component :is="tag" ref="el" class="partials-rich-text">
		<span v-if="prefix">{{ prefix }}</span>
		<LabelShuffle v-if="shuffle" :label="plaintext" :no-snap :reveal :speed />
		<StoryblokRichText v-else-if="doc && Array.isArray(doc.content)" :doc="doc" :resolvers="mergedResolvers" />
	</component>
</template>
