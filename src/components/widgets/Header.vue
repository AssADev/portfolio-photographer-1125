<script setup lang="ts">
import { useStore, useVModel } from '@nanostores/vue';
import { useEventListener, useResizeObserver } from '@vueuse/core';
import gsap from 'gsap';
import { computed, provide, ref, useTemplateRef, watch, watchEffect } from 'vue';

import { animations } from '#utils/Animations.ts';
import locales from '#utils/locales.json';
import { trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import ContactForms from '#components/widgets/ContactForms.vue';
import Menu from '#components/widgets/Menu.vue';

import type { LanguageAlternate } from '#types/seo.ts';

import { $global } from '#stores/global.ts';

// Props :
const { siteConfig, language, languageAlternates } = defineProps<{
	siteConfig: any;
	language: string;
	languageAlternates?: LanguageAlternate[];
}>();

// Providers & Stores :
provide('siteConfig', siteConfig);
const globalStore = useStore($global);
const contactFormId = useVModel($global, 'contactFormId');
const isContactToggled = useVModel($global, 'isContactToggled');
const isMenuToggled = useVModel($global, 'isMenuToggled');
const isAnimating = useVModel($global, 'isHeaderAnimating');

// Refs :
const interactionsRef = useTemplateRef('interactionsRef');
const contactLabelRef = useTemplateRef('contactLabelRef');

const scrollHide = ref(false);
const hidden = ref(false);

const contactFormsRef = ref<any>(null);
const menuRef = ref<any>(null);

const initialWidth = ref(0);
let tlHeader: gsap.core.Timeline | null = null;

// Computed :
const activeDrawer = computed(() => {
	if (isContactToggled.value) return contactFormsRef.value;
	if (isMenuToggled.value) return menuRef.value;
	return null;
});

const drawerEl = computed(() => activeDrawer.value?.drawerRef);

// Methods :
const toggleContact = () => {
	if (isAnimating.value) return;
	if (!isContactToggled.value) isMenuToggled.value = false;
	isContactToggled.value = !isContactToggled.value;
};

const toggleMenu = () => {
	if (isAnimating.value) return;
	if (!isMenuToggled.value) isContactToggled.value = false;
	isMenuToggled.value = !isMenuToggled.value;
};

const onContactToggled = (val: boolean) => {
	if (isAnimating.value) return;
	isContactToggled.value = val;
	if (!val) contactFormId.value = undefined;
};

const onMenuToggled = (val: boolean) => {
	if (isAnimating.value) return;
	isMenuToggled.value = val;
};

// Watchers :
watchEffect(() => {
	hidden.value = scrollHide.value;
});

watch([isContactToggled, isMenuToggled], async ([contactVal, menuVal], [oldContact, oldMenu]) => {
	if (isAnimating.value) return;
	isAnimating.value = true;

	if (tlHeader) {
		tlHeader.getChildren(true, true, true).forEach((tween: any) => {
			if (tween.data && tween.data.split) {
				tween.data.split.revert();
			}
		});
		tlHeader.kill();
	}

	try {
		// Opening Logic :
		if (contactVal || menuVal) {
			tlHeader = gsap.timeline();

			tlHeader.add(
				animations['hide-letters-speed'](contactLabelRef.value!, {
					onComplete: () => gsap.set(contactLabelRef.value!, { visibility: 'hidden' })
				})
			);

			tlHeader.to(
				interactionsRef.value,
				{ width: drawerEl.value?.offsetWidth || 365, duration: 0.6, ease: 'power2.inOut' },
				0
			);

			await tlHeader;

			const drawerTl = activeDrawer.value?.openDrawer?.();
			const onOpenTl = activeDrawer.value?.onOpen?.();

			if (drawerTl) await drawerTl;
			if (onOpenTl) await onOpenTl;
		}
		// Closing Logic :
		else {
			const drawerToClose =
				oldContact === true || (oldContact === undefined && !contactVal && isContactToggled.value === false)
					? contactFormsRef.value
					: oldMenu === true || (oldMenu === undefined && !menuVal && isMenuToggled.value === false)
						? menuRef.value
						: null;

			if (drawerToClose?.closeDrawer) {
				const drawerTl = drawerToClose.closeDrawer();
				if (drawerTl) await drawerTl;
			}

			tlHeader = gsap.timeline();

			if (interactionsRef.value) {
				tlHeader.to(interactionsRef.value, {
					width: initialWidth.value,
					duration: 0.6,
					ease: 'power2.inOut',
					clearProps: 'width'
				});
			}

			if (contactLabelRef.value) {
				tlHeader.add(
					animations['reveal-letters-speed'](contactLabelRef.value, {
						onStart: () => gsap.set(contactLabelRef.value!, { visibility: 'visible' })
					}),
					0.325
				);
			}

			await tlHeader;
		}
	} catch (e) {
		console.error('Header animation error:', e);
	} finally {
		isAnimating.value = false;
	}
});

// Events :
useEventListener('scroll', () => {
	scrollHide.value = window.scrollY > 20;
});

useResizeObserver(interactionsRef, () => {
	if (!isContactToggled.value && !isMenuToggled.value && !isAnimating.value) {
		const width = interactionsRef.value?.offsetWidth || 0;
		if (width > 0) initialWidth.value = width;
	}
});
</script>

<template>
	<header
		id="header"
		:class="{ hidden, 'header-dark': globalStore.headerTheme === 'dark' }"
		data-allow-mismatch="class"
	>
		<div class="header-container">
			<Button
				:to="language === locales[0] ? '/' : `/${language}`"
				class="identity-cta"
				@click="trackNavigationClick"
			>
				<span>{{ siteConfig.identity }}</span>
			</Button>

			<div
				ref="interactionsRef"
				class="interactions-container"
				:class="{ 'is-contact-open': isContactToggled, 'is-menu-open': isMenuToggled }"
			>
				<Button class="contact-cta" @click="toggleContact">
					<span ref="contactLabelRef">{{ $t('contactLabel') }}</span>
				</Button>
				<Button class="menu-cta" @click="toggleMenu" :aria-label="$t(isMenuToggled ? 'closeMenu' : 'openMenu')">
					<span>X</span>
				</Button>
				<Menu
					ref="menuRef"
					:toggled="isMenuToggled"
					@update:toggled="onMenuToggled"
					:language="language"
					:languageAlternates="languageAlternates"
				/>
				<ContactForms
					ref="contactFormsRef"
					:toggled="globalStore.isContactToggled"
					@update:toggled="onContactToggled"
					:language="language"
					:formId="globalStore.contactFormId"
				/>
			</div>
		</div>
	</header>
</template>

<style scoped lang="scss">
#header {
	position: fixed;
	z-index: 20;
	bottom: 0;
	left: 0;
	width: 100%;
	pointer-events: none;
}

.header-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: var(--header-height);
	margin: var(--gutter);

	& > * {
		pointer-events: auto;
	}
}

a,
button {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	overflow: hidden;
}

.identity-cta {
	background: $eerieBlack;
	padding-inline: var(--header-padding-inline);
	border-radius: var(--border-radius);

	span {
		@include roobert-14-uppercase;

		color: $white;
	}
}

.interactions-container {
	position: relative;
	display: flex;
	align-items: center;
	height: 100%;

	&.is-contact-open {
		.menu-cta {
			&::before {
				transform: translate3d(0, 0, 0);
				transition: transform 0.55s $power2InOut;
			}

			span {
				color: $eerieBlack;
			}
		}
	}

	&.is-menu-open {
		.contact-cta {
			&::before {
				transform: translate3d(0, 0, 0);
				transition: transform 0.625s $power2InOut;
			}

			span {
				color: $white;
				transition: color 0.4s $power2Out 0.2s;
			}
		}
	}

	.contact-cta {
		position: relative;
		width: 100%;
		background: $whiteChoco;
		justify-content: flex-start;
		border-radius: var(--border-radius);
		padding-inline: var(--header-padding-inline);
		padding-inline-end: 54px;

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: $eerieBlack;
			border-radius: inherit;
			pointer-events: none;
			transform: translate3d(100%, 0, 0);
			transition: transform 0.85s $power2InOut;
		}

		span {
			@include roobert-14-uppercase;

			position: relative;
			color: $eerieBlack;
			transition: color 0.25s $power2Out 0.275s;
		}
	}

	.menu-cta {
		position: absolute;
		right: 0;
		background: $eerieBlack;
		border-radius: var(--border-radius);
		aspect-ratio: 1/1;

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: $whiteChoco;
			border-radius: inherit;
			pointer-events: none;
			transform: translate3d(-100%, 0, 0);
			transition: transform 0.4125s $power2InOut 0.125s;
		}

		span {
			@include roobert-14-uppercase;

			position: relative;
			color: $white;
			transition: color 0.25s $power2Out 0.25s;
		}
	}
}
</style>
