<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import gsap from 'gsap';
import { computed, inject, ref, useTemplateRef } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Icon from '#components/utils/Icon.vue';

import type { StoryblokSiteConfig } from '#types/component-types-sb.js';

// Types :
type MenuSocial = {
	label?: string;
	link: { url?: string; target?: string };
};

// Injections :
const siteConfig = inject<StoryblokSiteConfig>('siteConfig');

// Refs :
const menuSocialsContainerRef = useTemplateRef('menuSocialsContainerRef');
const floatingIconRef = useTemplateRef('floatingIconRef');

const isIconVisible = ref(false);

// Computed :
const menuSocials = computed<MenuSocial[]>(() => {
	const socials: MenuSocial[] = siteConfig?.socials || [];
	const email = siteConfig?.email;

	if (email) {
		return [
			...socials,
			{
				link: { url: `mailto:${email}`, target: '_blank' },
				label: email
			}
		];
	}
	return socials;
});

// Methods :
const handleSocialHover = (e: MouseEvent | FocusEvent) => {
	const target = e.currentTarget as HTMLElement;

	if (!menuSocialsContainerRef.value || !floatingIconRef.value) return;

	const containerRect = menuSocialsContainerRef.value.getBoundingClientRect();
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

const handleSocialFocusOut = (e: FocusEvent) => {
	if (!menuSocialsContainerRef.value?.contains(e.relatedTarget as Node | null)) handleSocialLeave();
};

// Delegated from the focusable links of the list :
useEventListener(menuSocialsContainerRef, 'mouseleave', handleSocialLeave);
useEventListener(menuSocialsContainerRef, 'focusout', handleSocialFocusOut);
</script>

<template>
	<ul ref="menuSocialsContainerRef" class="menu-socials-container">
		<li ref="floatingIconRef" class="floating-icon" aria-hidden="true">
			<Icon name="square-small" :class="{ visible: isIconVisible }" />
		</li>
		<li v-for="social in menuSocials" :key="social.label">
			<a
				:href="social.link.url"
				v-bind="getLinkAttributes(social.link)"
				@mouseenter="handleSocialHover"
				@focus="handleSocialHover"
				@click="trackNavigationClick"
			>
				<span>{{ social.label }}</span>
			</a>
		</li>
	</ul>
</template>

<style scoped lang="scss">
.menu-socials-container {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 32px var(--menu-padding-inline) 16px;
	margin-block-end: var(--header-height);
	pointer-events: none;

	@include hover {
		li {
			width: 100%;
		}
	}

	.floating-icon {
		position: absolute;
		top: 0;
		left: var(--menu-padding-inline);
		pointer-events: none;

		& > svg {
			position: absolute;
			transform: translate3d(0, -50%, 0) scale3d(0, 0, 0) rotate(90deg);
			transform-origin: center center;
			transition: transform 0.4s $power2Out;

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
			gap: 5px;
			align-items: center;

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
</style>
