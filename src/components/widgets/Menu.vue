<script setup lang="ts">
import gsap from 'gsap';
import { computed, inject, ref, useTemplateRef } from 'vue';

import { animations } from '#utils/Animations.ts';
import locales from '#utils/locales.json';
import { nl2br } from '#utils/nl2br.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

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

// Refs :
const drawerMenuRef = ref<any>(null);

const titleRef = useTemplateRef('titleRef');
const descriptionRef = useTemplateRef('descriptionRef');
const linksRef = useTemplateRef('linksRef');

let tl: gsap.core.Timeline | null = null;

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

const orderedLocales = computed(() => {
	// Place current language first, followed by other locales :
	return [language, ...locales.filter((locale) => locale !== language)];
});

// Methods :
/**
 * Finds the most specific (closest) matching menu item for the current path
 */
const findActiveMenuItem = (menuItems: any[], currentPath: string) => {
	const normalizedCurrentPath = currentPath.replace(/\/$/, '');

	return menuItems.find((item) => {
		const normalizedMenuLink = item.link.replace(/\/$/, '');
		return normalizedMenuLink === normalizedCurrentPath;
	});
};

// Animatinon :
const onOpen = () => {
	tl?.kill();
	tl = gsap.timeline();

	if (titleRef.value) tl.add(animations['reveal-paragraphs'](titleRef.value, { delay: 0.45 }), 0);
	if (descriptionRef.value) tl.add(animations['reveal-paragraphs'](descriptionRef.value, { delay: 0.475 }), 0);

	linksRef.value?.forEach((form: any, index: number) => {
		const reverseIndex = linksRef.value!.length - 1 - index;

		const label = form.querySelector('span');

		tl!.add(animations['reveal-paragraphs'](label, { delay: 0.15 + reverseIndex * 0.1 }), 0);
	});

	return tl;
};

// Expose :
defineExpose({
	onOpen,
	drawerRef: computed(() => drawerMenuRef.value?.drawerRef),
	containerRef: computed(() => drawerMenuRef.value?.containerRef),
	openDrawer: () => drawerMenuRef.value?.openDrawer(),
	closeDrawer: () => drawerMenuRef.value?.closeDrawer()
});
</script>

<template>
	<DrawerMenu ref="drawerMenuRef" v-model:toggled="toggled" theme="dark">
		<template v-if="identity || menuDescription" #title>
			<p v-if="identity" ref="titleRef" class="title">{{ identity }}</p>
			<p v-if="menuDescription" ref="descriptionRef" class="description" v-html="nl2br(menuDescription)"></p>
		</template>
		<ul v-if="menuLinks" class="links-container">
			<li v-for="item in activeMenuItems" :key="item.label" :class="{ active: item.active }">
				<a
					ref="linksRef"
					:href="item.link"
					role="menuitem"
					:aria-current="item.active ? 'page' : undefined"
					@click="trackNavigationClick"
				>
					<span>{{ item.label }}</span>
				</a>
			</li>
		</ul>
	</DrawerMenu>
</template>

<style scoped lang="scss">
@use 'sass:map';

$border: 1px solid rgba($white, 0.08);

.links-container {
	display: flex;
	flex-direction: column;
	border-top: $border;

	@include hover-child-not-self('li.active') {
		&::before {
			opacity: 0;
			transform: translate3d(-50%, 0, 0);
		}
	}

	li {
		position: relative;
		border-bottom: $border;

		&:last-child {
			border-bottom: none;
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
			background: map.get($gradients, 'menu-white');
			transition:
				opacity 0.4s $power2Out,
				transform 0.4s $power2Out 0.3s;
			transform: translate3d(-50%, 0, 0);
			pointer-events: none;
		}

		a {
			@include roobert-20-uppercase;

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
