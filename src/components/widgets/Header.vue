<script setup lang="ts">
import { useStore, useVModel } from '@nanostores/vue';
import { useEventListener, useResizeObserver } from '@vueuse/core';
import gsap from 'gsap';
import { computed, provide, ref, useTemplateRef, watch, watchEffect } from 'vue';

import { animations } from '#utils/Animations.ts';
import locales from '#utils/locales.json';
import { trackNavigationClick } from '#utils/tracking.ts';

import Button from '#components/utils/Button.vue';
import Icon from '#components/utils/Icon.vue';
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

const contactActionRef = useTemplateRef('contactActionRef');
const languagesRef = useTemplateRef('languagesRef');
const languageItemsRef = useTemplateRef('languageItemsRef');
const languageIconsRef = useTemplateRef('languageIconsRef');

// Computed :
const activeDrawer = computed(() => {
	if (isContactToggled.value) return contactFormsRef.value;
	if (isMenuToggled.value) return menuRef.value;
	return null;
});

const orderedLocales = computed(() => {
	return [language, ...(locales as string[]).filter((locale) => locale !== language)];
});

const isContactFormActive = computed(() => globalStore.value.isContactFormActive);

const drawerEl = computed(() => activeDrawer.value?.containerRef);

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

const handleContactAction = () => {
	console.log('handleContactAction');
	console.log(isAnimating.value, isMenuToggled.value, isContactFormActive.value);

	if (isAnimating.value || isMenuToggled.value) return;

	if (isContactToggled.value) {
		isContactFormActive.value ? contactFormsRef.value?.backToChoices() : (isContactToggled.value = false);
		return;
	}

	toggleContact();
};

const onActionLeave = (el: any, done: () => void) => {
	const label = el.querySelector('span');
	if (label) {
		const anim = animations['hide-letters-speed'](label, { onComplete: done });
		gsap.delayedCall(Math.max(0, anim.totalDuration() - 0.25), done);
	} else {
		done();
	}
};

const onActionEnter = (el: any, done: () => void) => {
	const label = el.querySelector('span');
	if (label) {
		const anim = animations['reveal-letters-speed'](label, { onComplete: done });
		gsap.delayedCall(Math.max(0, anim.totalDuration() - 0.25), done);
	} else {
		done();
	}
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

			// 1. Hide Contact label :
			tlHeader.add(
				animations['hide-letters-speed'](contactLabelRef.value!, {
					onComplete: () => gsap.set(contactLabelRef.value!, { visibility: 'hidden' })
				}),
				0
			);

			// 2. Expand width :
			tlHeader.to(
				interactionsRef.value,
				{ width: drawerEl.value?.offsetWidth || 365, duration: 0.6, ease: 'power2.inOut' },
				0
			);

			// 3. Open drawer :
			const drawerTl = activeDrawer.value?.openDrawer?.();
			const onOpenTl = activeDrawer.value?.onOpen?.();

			if (drawerTl) tlHeader.add(drawerTl, 0.1);
			if (onOpenTl) tlHeader.add(onOpenTl, 0.2);

			// 4. Reveal new Header content :
			if (menuVal) {
				// Reveal Languages :
				tlHeader.set(languagesRef.value, { visibility: 'visible' }, 0.4);
				languageItemsRef.value?.forEach((item: any, index: number) => {
					tlHeader!.add(animations['reveal-letters'](item, { delay: 0.1 * index }), 0.4);
				});
				languageIconsRef.value?.forEach((icon: any, index: number) => {
					tlHeader!.add(animations['scale-up'](icon?.$el || icon, { delay: 0.05 + 0.1 * index }), 0.4);
				});
			} else {
				// Reveal Close/Back :
				tlHeader.set(contactActionRef.value, { visibility: 'visible' }, 0.4);
				const label = contactActionRef.value?.querySelector('.label-action span');
				if (label) tlHeader.add(animations['reveal-letters-speed'](label as HTMLElement, {}), 0.4);
			}

			await tlHeader;
		}
		// Closing Logic :
		else {
			const drawerToClose =
				oldContact === true || (oldContact === undefined && !contactVal && isContactToggled.value === false)
					? contactFormsRef.value
					: oldMenu === true || (oldMenu === undefined && !menuVal && isMenuToggled.value === false)
						? menuRef.value
						: null;

			let drawerTl;
			if (drawerToClose?.closeDrawer) drawerTl = drawerToClose.closeDrawer();

			tlHeader = gsap.timeline();

			// 1. Hide current Header content :
			if (oldMenu) {
				languageItemsRef.value?.forEach((item: any, index: number) => {
					tlHeader!.add(animations['hide-letters-speed'](item, { delay: 0.05 * index }), 0);
				});
				tlHeader.set(languagesRef.value, { visibility: 'hidden' }, 0.3);
			} else if (oldContact) {
				const label = contactActionRef.value?.querySelector('.label-action span');
				if (label) tlHeader.add(animations['hide-letters-speed'](label as HTMLElement, {}), 0);
				tlHeader.set(contactActionRef.value, { visibility: 'hidden' }, 0.3);
			}

			// 2. Shrink width :
			tlHeader.to(interactionsRef.value, {
				width: initialWidth.value,
				duration: 0.6,
				ease: 'power2.inOut',
				clearProps: 'width'
			});

			// 3. Reveal original Contact Label :
			if (contactLabelRef.value) {
				tlHeader.add(
					animations['reveal-letters-speed'](contactLabelRef.value, {
						onStart: () => gsap.set(contactLabelRef.value!, { visibility: 'visible' })
					}),
					0.325
				);
			}

			if (drawerTl) await drawerTl;
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
				<Button class="contact-cta" @click="handleContactAction">
					<span ref="contactLabelRef" class="label-contact">{{ $t('contactLabel') }}</span>

					<div ref="languagesRef" class="languages-wrapper">
						<ul class="languages-selector-container">
							<template v-for="(locale, index) in orderedLocales" :key="locale">
								<li>
									<span v-if="locale === language" ref="languageItemsRef">{{ locale }}</span>
									<a
										v-else
										ref="languageItemsRef"
										:href="
											languageAlternates
												?.find((alt) => alt.hrefLang.split('-')[0] === locale)
												?.href.toString() || (locale === locales[0] ? '/' : `/${locale}`)
										"
									>
										<span>{{ locale }}</span>
									</a>
								</li>
								<Icon
									v-if="index < orderedLocales.length - 1"
									ref="languageIconsRef"
									name="square-small"
								/>
							</template>
						</ul>
					</div>

					<div ref="contactActionRef" class="label-action-wrapper">
						<transition mode="out-in" :css="false" @leave="onActionLeave" @enter="onActionEnter">
							<div :key="isContactFormActive ? 'back' : 'close'" class="label-action">
								<span>{{ isContactFormActive ? $t('backToChoices') : $t('close') }}</span>
							</div>
						</transition>
					</div>
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
			background: $whiteChoco;
			transition: background 0.3s $power2InOut 0.25s;

			&::before {
				transform: translate3d(0, 0, 0);
				transition: transform 0.55s $power2InOut;
			}

			span {
				color: $eerieBlack;
				transition: color 0.25s $power2Out 0.25s;
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
		padding-inline: var(--header-padding-inline) 54px;
		overflow: hidden;

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

		.label-contact,
		.label-action,
		.languages-wrapper {
			@include roobert-14-uppercase;

			position: relative;
			color: $eerieBlack;
			transition: color 0.25s $power2Out 0.275s;
		}

		.label-action-wrapper,
		.languages-wrapper {
			position: absolute;
			left: var(--header-padding-inline);
			top: 50%;
			transform: translate3d(0, -50%, 0);
			visibility: hidden;
		}

		.label-action {
			display: flex;
			align-items: center;
		}

		.languages-selector-container {
			display: flex;
			align-items: center;
			gap: 5px;
			color: $white;

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
	}

	.menu-cta {
		position: absolute;
		right: 0;
		background: $eerieBlack;
		border-radius: var(--border-radius);
		aspect-ratio: 1/1;
		transition: background 0.3s $power2InOut 0.6125s;

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: $whiteChoco;
			border-radius: inherit;
			pointer-events: none;
			transform: translate3d(-100%, 0, 0);
			transition: transform 0.425s $power2InOut 0.675s;
		}

		span {
			@include roobert-14-uppercase;

			position: relative;
			color: $white;
			transition: color 0.25s $power2Out 0.8s;
		}
	}
}
</style>
