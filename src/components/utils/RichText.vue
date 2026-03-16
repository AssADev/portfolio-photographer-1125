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
	speed = 'fast'
} = defineProps<{
	doc: StoryblokRichtext;
	resolvers?: Record<string, (node: StoryblokRichTextNode<VNode>) => VNode>;
	shuffle?: boolean;
	noSnap?: boolean;
	reveal?: boolean;
	prefix?: string;
	speed?: 'normal' | 'fast';
}>();

// Refs :
const el = useTemplateRef('el');

// Router :
const { location } = useRouter();

// Computed :
const plaintext = computed(() => {
	if (!shuffle || !doc) return '';

	const extractText = (node: any): string => {
		if (node.text) return node.text;
		if (node.content && Array.isArray(node.content)) {
			return node.content.map(extractText).join('');
		}
		return '';
	};

	return extractText(doc);
});

// Resolvers :
const markResolvers = {
	textStyle: (node: any) => {
		const color = node.attrs?.color?.trim();

		if (!color) return node.text;

		return h('span', { style: `color:${color}` }, node.text);
	},
	link: (node: any) => {
		const { href, target, story } = node.attrs;

		const currentPath = location.value.pathname.replace(/\/$/, '') || '/';
		let targetPath = href;
		let isInternal = !href.startsWith('http') && !href.startsWith('//');

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

		return h(
			'a',
			{
				href: href,
				target: isForm ? undefined : target,
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

const mergedResolvers = {
	...markResolvers,
	...resolvers
};

// Expose :
defineExpose({ el });
</script>

<template>
	<div ref="el" class="partials-rich-text">
		<span v-if="prefix">{{ prefix }}</span>
		<LabelShuffle v-if="shuffle" :label="plaintext" :no-snap :reveal :speed />
		<StoryblokRichText
			v-else-if="doc && Array.isArray(doc.content)"
			:doc="doc"
			:resolvers="(mergedResolvers as any)"
		/>
	</div>
</template>
