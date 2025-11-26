<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';
import locales from '#utils/locales.json';
import { nl2br } from '#utils/nl2br.ts';

import { useRouter } from '#components/composables/useRouter.ts';
import Icon from '#components/utils/Icon.vue';

import type { LanguageAlternate } from '#types/seo.ts';

const { menu, language, languageAlternates } = defineProps<{
	menu: any;
	language: string;
	languageAlternates?: LanguageAlternate[];
}>();

// Variables :
const menuItems = menu.links.map((item: any) => ({
	link: item.link.url,
	label: item.label || item.link.name || ''
}));

const socialsContainerRef = useTemplateRef('socialsContainerRef');
const floatingIconRef = useTemplateRef('floatingIconRef');
const isIconVisible = ref(false);
const iconTranslateY = ref(0);

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
	return menuItems.map((i: any) => ({ ...i, active: i === activeItem }));
});

// Floating icon for socials :
const handleSocialHover = (e: MouseEvent) => {
	const target = e.currentTarget as HTMLElement;

	if (!socialsContainerRef.value || !floatingIconRef.value) return;

	const containerRect = socialsContainerRef.value.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();
	const iconRect = floatingIconRef.value.getBoundingClientRect();

	// Calculate the center position of the hovered link relative to the container :
	const targetCenter = targetRect.top - containerRect.top + targetRect.height / 2;
	const iconHalfHeight = iconRect.height / 2;

	iconTranslateY.value = targetCenter - iconHalfHeight;
	isIconVisible.value = true;
};

const handleSocialLeave = () => {
	isIconVisible.value = false;
};
</script>

<template>
	<nav class="menu">
		<div class="menu-container">
			<div v-if="menu.identity || menu.description" class="informations-container">
				<p v-if="menu.identity" class="title">{{ menu.identity }}</p>
				<p v-if="menu.description" class="description" v-html="nl2br(menu.description)"></p>
			</div>
			<ul v-if="menu.links" class="links-container">
				<li v-for="item in activeMenuItems" :key="item.label" :class="{ active: item.active }">
					<a :href="item.link" role="menuitem" :aria-current="item.active ? 'page' : undefined">
						<span>{{ item.label }}</span>
					</a>
				</li>
			</ul>
			<ul ref="socialsContainerRef" class="socials-container" @mouseleave="handleSocialLeave">
				<div ref="floatingIconRef" class="floating-icon">
					<Icon name="square-small" :class="{ visible: isIconVisible }" />
				</div>
				<li v-for="social in menu.socials" :key="social.name">
					<a v-bind="getLinkAttributes(social.link)" @mouseenter="handleSocialHover">
						<span>{{ social.label }}</span>
					</a>
				</li>
				<li v-if="menu.email">
					<a :href="`mailto:${menu.email}`" @mouseenter="handleSocialHover">
						<span>{{ menu.email }}</span>
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
								languageAlternates
									?.find((alt) => alt.hrefLang.split('-')[0] === locale)
									?.href.toString() || `/${locale}`
							"
						>
							<span>{{ locale }}</span>
						</a>
					</li>
					<Icon v-if="index < locales.length - 1" name="square-small" />
				</template>
			</ul>
		</div>
	</nav>
</template>

<style scoped lang="scss">
$border: 1px solid rgba($white, 0.08);

.menu {
	--padding-inline: 14px;

	position: fixed;
	bottom: var(--gutter);
	right: var(--gutter);
	z-index: 25;
	max-width: 365px;
	width: 100%;
}

.menu-container {
	width: 100%;
	height: fit-content;
	color: $white;
	background: $eerieBlack;
	border-radius: 4px;
	overflow: hidden;
}

.informations-container {
	display: flex;
	flex-direction: column;
	gap: 14px;
	padding: 20px var(--padding-inline) 16px;

	.title {
		@include roobert-20;
	}

	.description {
		@include roobert-14;

		opacity: 0.5;
	}
}

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
			padding: 24px var(--padding-inline);
			transition: opacity 0.4s $power2Out;
		}
	}
}

.socials-container {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 32px var(--padding-inline) 16px;

	.floating-icon {
		--translate-y: v-bind("iconTranslateY + 'px'");
		transition: transform 0.4s $power2Out;

		position: absolute;
		left: var(--padding-inline);
		top: 0;
		pointer-events: none;
		transform: translate3d(0, var(--translate-y), 0);

		& > svg {
			transition: transform 0.4s $power2InOut;
			transform: scale3d(0, 0, 0) rotate(90deg);
			transform-origin: center center;

			&.visible {
				transform: scale3d(1, 1, 1) rotate(0deg);
				transition: transform 0.6s $elasticOut 0.1s;
			}
		}
	}

	li {
		width: fit-content;

		a {
			@include a11y-focus;
			@include roobert-12-uppercase;

			position: relative;
			display: flex;
			align-items: center;
			gap: 5px;

			@include hover {
				span {
					transform: translate3d(9px, 0, 0);
					transition: transform 0.4s $power2Out;
				}
			}

			span {
				transition: transform 0.4s $power2Out;
			}
		}
	}
}

.languages-selector-container {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 16px var(--padding-inline);
	border-top: $border;

	li {
		@include hover {
			a {
				opacity: 1;
			}
		}

		a {
			@include a11y-focus;

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
