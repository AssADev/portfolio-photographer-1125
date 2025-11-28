<script setup lang="ts">
import { useVModel } from '@nanostores/vue';
import gsap from 'gsap';
import { computed, inject, onMounted, ref, useTemplateRef, watch } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';
import locales from '#utils/locales.json';
import { nl2br } from '#utils/nl2br.ts';

import Icon from '#components/utils/Icon.vue';

import type { LanguageAlternate } from '#types/seo.ts';

import { useRouter } from '#composables/useRouter.ts';
import { useTrap } from '#composables/useTrap.ts';
import { $global } from '#stores/global.ts';

// Props & Model :
const { language, languageAlternates } = defineProps<{
	language: string;
	languageAlternates?: LanguageAlternate[];
}>();

const lockScroll = useVModel($global, 'lockScroll');
const toggled = defineModel<boolean>('toggled', { default: false });

// Injections :
const siteConfig = inject<any>('siteConfig');

// Refs :
const menuRef = useTemplateRef('menuRef');
const socialsContainerRef = useTemplateRef('socialsContainerRef');
const floatingIconRef = useTemplateRef('floatingIconRef');

const isIconVisible = ref(false);
let tl: gsap.core.Timeline | null = null;

// Composables :
const { location } = useRouter();

// Computed :
const menuItems = computed(() => {
	return (
		siteConfig?.menuLinks?.map((item: any) => ({
			link: item.link.url,
			label: item.label || item.link.name || ''
		})) || []
	);
});

const menuSocials = computed(() => {
	const socials = siteConfig?.socials || [];
	const email = siteConfig?.email;

	if (email) {
		return [
			...socials,
			{
				link: { url: `mailto:${email}`, target: '_blank' },
				label: email
			}
		] as any[];
	}
	return socials as any[];
});

const activeMenuItems = computed(() => {
	const activeItem = findActiveMenuItem(menuItems.value, location.value.pathname);
	return menuItems.value.map((i: any) => ({ ...i, active: i === activeItem }));
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

const handleSocialHover = (e: MouseEvent) => {
	const target = e.currentTarget as HTMLElement;

	if (!socialsContainerRef.value || !floatingIconRef.value) return;

	const containerRect = socialsContainerRef.value.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();
	const iconRect = floatingIconRef.value.getBoundingClientRect();

	// Calculate the center position of the hovered link relative to the container :
	const targetCenter = targetRect.top - containerRect.top + targetRect.height / 2;
	const iconHalfHeight = iconRect.height / 2;

	const newY = targetCenter - iconHalfHeight;

	// Animation :
	if (!isIconVisible.value) {
		gsap.set(floatingIconRef.value, { y: newY });
		isIconVisible.value = true;
	} else {
		gsap.to(floatingIconRef.value, {
			y: newY,
			duration: 0.4,
			ease: 'power2.out',
			overwrite: true
		});
	}
};

const handleSocialLeave = () => {
	isIconVisible.value = false;
};

// Animations :
const openMenu = () => {
	lockScroll.value = true;

	tl?.kill();
	tl = gsap.timeline();

	gsap.set(menuRef.value, { visibility: 'visible' });

	tl.to(menuRef.value, {
		autoAlpha: 1,
		y: 0,
		duration: 0.6,
		ease: 'expo.out'
	});

	const elements = menuRef.value?.querySelectorAll(
		'.informations-container > *, .links-container > li, .socials-container, .languages-selector-container'
	);

	if (elements?.length) {
		tl.fromTo(
			elements,
			{ y: 20, opacity: 0 },
			{ y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
			'<0.1'
		);
	}
};

const closeMenu = () => {
	lockScroll.value = false;

	tl?.kill();
	tl = gsap.timeline();

	tl.to(menuRef.value, {
		autoAlpha: 0,
		y: 20,
		duration: 0.4,
		ease: 'power2.out'
	});
};

// Lifecycle & Watchers :
onMounted(() => {
	gsap.set(menuRef.value, { autoAlpha: 0, y: 20 });
});

watch(toggled, (isToggled) => {
	if (isToggled) openMenu();
	else closeMenu();
});

// Traps :
useTrap(menuRef, { model: toggled, clickOutsideDeactivates: true, escapeDeactivates: true });
</script>

<template>
	<nav ref="menuRef" class="menu">
		<div class="menu-container">
			<div v-if="siteConfig?.identity || siteConfig?.menuDescription" class="informations-container">
				<p v-if="siteConfig?.identity" class="title">{{ siteConfig.identity }}</p>
				<p
					v-if="siteConfig?.menuDescription"
					class="description"
					v-html="nl2br(siteConfig.menuDescription)"
				></p>
			</div>
			<ul v-if="siteConfig?.menuLinks" class="links-container">
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
				<li v-for="social in menuSocials" :key="social.label">
					<a v-bind="getLinkAttributes(social.link)" @mouseenter="handleSocialHover">
						<span>{{ social.label }}</span>
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
	opacity: 0;
	visibility: hidden;
	transform: translate3d(0, 20px, 0);
}

.menu-container {
	width: 100%;
	height: fit-content;
	color: $white;
	background: $eerieBlack;
	border-radius: var(--border-radius);
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
	pointer-events: none;

	@include hover {
		li {
			width: 100%;
		}
	}

	.floating-icon {
		position: absolute;
		left: var(--padding-inline);
		top: 0;
		pointer-events: none;

		& > svg {
			position: absolute;
			transition: transform 0.4s $power2Out;
			transform: translate3d(0, -50%, 0) scale3d(0, 0, 0) rotate(90deg);
			transform-origin: center center;

			&.visible {
				transform: translate3d(0, -50%, 0) scale3d(1, 1, 1) rotate(0deg);
				transition: transform 0.4s $elasticOut 0.1s;
			}
		}
	}

	li {
		width: fit-content;
		pointer-events: all;

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
