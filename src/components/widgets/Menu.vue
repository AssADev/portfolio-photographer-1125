<script setup lang="ts">
import { computed } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';
import locales from '#utils/locales.json';
import { nl2br } from '#utils/nl2br.ts';

import { useRouter } from '#components/composables/useRouter.ts';

import type { LanguageAlternate } from '#types/seo.ts';

const { menu, language, languageAlternates } = defineProps<{
	menu: any;
	language: string;
	languageAlternates?: LanguageAlternate[];
}>();

// Variables :
const menuItems = menu.links.map((item) => ({
	link: item.link.url,
	label: item.label || item.link.name || ''
}));

/**
 * Updates current page and closes menu on route change
 */
const { location } = useRouter();

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

const activeMenuItems = computed(() => {
	const activeItem = findActiveMenuItem(menuItems, location.value.pathname);
	return menuItems.map((i) => ({ ...i, active: i === activeItem }));
});
</script>

<template>
	<nav class="menu">
		<div class="menu-container">
			<div v-if="menu.identity || menu.description" class="informations-container">
				<div v-if="menu.identity" class="title">{{ menu.identity }}</div>
				<div v-if="menu.description" class="description" v-html="nl2br(menu.description)"></div>
			</div>
			<ul v-if="menu.links" class="links-container">
				<li v-for="item in activeMenuItems" :key="item.label" :class="{ active: item.active }">
					<a :href="item.link" role="menuitem" :aria-current="item.active ? 'page' : undefined">
						<span>{{ item.label }}</span>
					</a>
				</li>
			</ul>
			<ul class="socials-container">
				<li v-for="social in menu.socials" :key="social.name">
					<a v-bind="getLinkAttributes(social.link)">
						<span>{{ social.label }}</span>
					</a>
				</li>
			</ul>
			<ul class="languages-switcher-container">
				<li v-for="locale in locales" :key="locale">
					<div v-if="locale === language">{{ locale }}</div>
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
			</ul>
		</div>
	</nav>
</template>

<style scoped lang="scss">
.menu {
	position: fixed;
	bottom: 0;
	right: 0;
	z-index: 25;
	max-width: 365px;
	width: 100%;
}
</style>
