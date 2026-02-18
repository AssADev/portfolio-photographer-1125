<script setup lang="ts">
import gsap from 'gsap';
import { computed, inject, ref, useTemplateRef } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import Icon from '#components/utils/Icon.vue';

// Injections :
const siteConfig = inject<any>('siteConfig');

// Refs :
const menuSocialsContainerRef = useTemplateRef('menuSocialsContainerRef');
const floatingIconRef = useTemplateRef('floatingIconRef');

const isIconVisible = ref(false);

// Computed :
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

// Methods :
const handleSocialHover = (e: MouseEvent) => {
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
</script>

<template>
	<ul ref="menuSocialsContainerRef" class="menu-socials-container" @mouseleave="handleSocialLeave">
		<div ref="floatingIconRef" class="floating-icon">
			<Icon name="square-small" :class="{ visible: isIconVisible }" />
		</div>
		<li v-for="social in menuSocials" :key="social.label">
			<a v-bind="getLinkAttributes(social.link)" @mouseenter="handleSocialHover" @click="trackNavigationClick">
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
		left: var(--menu-padding-inline);
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
</style>
