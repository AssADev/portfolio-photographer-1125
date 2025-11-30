<script setup lang="ts">
import { computed, inject } from 'vue';

import locales from '#utils/locales.json';
import { nl2br } from '#utils/nl2br.ts';

import DrawerMenu from '#components/partials/DrawerMenu.vue';
import Icon from '#components/utils/Icon.vue';

import type { StoryblokLabelLink } from '#types/component-types-sb.js';
import type { LanguageAlternate } from '#types/seo.ts';

import { useRouter } from '#composables/useRouter.ts';

// Injections :
const siteConfig = inject<any>('siteConfig');

// Props & Model :
const { language, languageAlternates } = defineProps<{
	language: string;
	languageAlternates?: LanguageAlternate[];
}>();

const toggled = defineModel<boolean>('toggled', { default: false });

const { identity, menuDescription, menuLinks } = siteConfig;

// Composables :
const { location } = useRouter();

// Computed :
const menuItems = computed(() => {
	return (
		menuLinks?.map((item: StoryblokLabelLink) => ({
			link: item.link.url,
			label: item.label || item.link.name || ''
		})) || []
	);
});

const activeMenuItems = computed(() => {
	const activeItem = findActiveMenuItem(menuItems.value, location.value.pathname);
	return menuItems.value.map((i: StoryblokLabelLink) => ({ ...i, active: i === activeItem }));
});

// Methods :
/**
 * Finds the most specific (closest) matching menu item for the current path
 */
const findActiveMenuItem = (menuItems: any[], currentPath: string) => {
	const normalizedCurrentPath = currentPath.replace(/\/$/, '');

	let bestMatch = null;
	let bestMatchLength = -1;

	for (const item of menuItems) {
		const normalizedMenuLink = item.link.replace(/\/$/, '');

		// Exact match (highest priority) :
		if (normalizedMenuLink === normalizedCurrentPath) return item;

		// Parent folder match (check if current path starts with menu link + slash) :
		if (normalizedMenuLink && normalizedCurrentPath.startsWith(normalizedMenuLink + '/')) {
			// Keep track of the longest matching path (most specific) :
			if (normalizedMenuLink.length > bestMatchLength) {
				bestMatch = item;
				bestMatchLength = normalizedMenuLink.length;
			}
		}
	}

	return bestMatch;
};
</script>

<template>
	<DrawerMenu v-model:toggled="toggled" theme="dark">
		<template v-if="identity || menuDescription" #title>
			<p v-if="identity" class="title">{{ identity }}</p>
			<p v-if="menuDescription" class="description" v-html="nl2br(menuDescription)"></p>
		</template>
		<ul v-if="menuLinks" class="links-container">
			<li v-for="item in activeMenuItems" :key="item.label" :class="{ active: item.active }">
				<a :href="item.link" role="menuitem" :aria-current="item.active ? 'page' : undefined">
					<span>{{ item.label }}</span>
				</a>
			</li>
		</ul>
		<ul class="languages-selector-container">
			<template v-for="(locale, index) in locales" :key="locale">
				<li>
					<span v-if="locale === language">{{ locale }}</span>
					<a
						v-else
						:href="
							languageAlternates?.find((alt) => alt.hrefLang.split('-')[0] === locale)?.href.toString() ||
							`/${locale}`
						"
					>
						<span>{{ locale }}</span>
					</a>
				</li>
				<Icon v-if="index < locales.length - 1" name="square-small" />
			</template>
		</ul>
	</DrawerMenu>
</template>

<style scoped lang="scss">
$border: 1px solid rgba($white, 0.08);

.links-container {
	display: flex;
	flex-direction: column;

	@include hover-child-not-self('li.active') {
		&::before {
			opacity: 0;
			transform: translate3d(-50%, 0, 0);
		}
	}

	li {
		position: relative;
		border-bottom: $border;

		&:first-child {
			border-top: $border;
		}

		@include hover {
			&::before {
				opacity: 1;
				transform: translate3d(0, 0, 0);
				transition:
					opacity 0.4s $power2Out,
					transform 0.4s $power2Out;
			}

			a {
				opacity: 1;
			}
		}

		&.active {
			&::before {
				opacity: 1;
				transform: translate3d(0, 0, 0);
				transition:
					opacity 0.4s $power2Out,
					transform 0.4s $power2Out;
			}

			a {
				opacity: 1;
				pointer-events: none;
			}
		}

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			opacity: 0;
			background: linear-gradient(90deg, rgba($whiteChoco, 0.05) 0%, rgba($whiteChoco, 0) 100%);
			transition:
				opacity 0.4s $power2Out,
				transform 0.4s $power2Out 0.3s;
			transform: translate3d(-50%, 0, 0);
			pointer-events: none;
		}

		a {
			@include roobert-20;

			display: block;
			width: 100%;
			height: 100%;
			opacity: 0.6;
			padding: 24px var(--menu-padding-inline);
			transition: opacity 0.4s $power2Out;
		}
	}
}

.languages-selector-container {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 16px var(--menu-padding-inline);
	border-top: $border;
	li {
		@include hover {
			a {
				opacity: 1;
			}
		}

		& > * {
			display: flex;
		}

		a {
			@include a11y-focus;
			@include roobert-12-uppercase;

			position: relative;
			opacity: 0.5;
			transition: opacity 0.4s $power2Out;
		}

		span {
			@include roobert-12-uppercase;
		}
	}
}
</style>
