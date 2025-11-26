<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { useEventListener } from '@vueuse/core';
import { ref, watchEffect } from 'vue';

import Button from '#components/utils/Button.vue';
import Menu from '#components/widgets/Menu.vue';

import type { LanguageAlternate } from '#types/seo.ts';

import { $global } from '#stores/global.ts';

const { siteConfig, language, languageAlternates } = defineProps<{
	siteConfig: any;
	language: string;
	languageAlternates?: LanguageAlternate[];
}>();

// Variables :
const globalStore = useStore($global);

const scrollHide = ref(false);
const hidden = ref(false);

const menuConfig = {
	identity: siteConfig.identity,
	description: siteConfig.menuDescription,
	links: siteConfig.menuLinks,
	socials: siteConfig.socials,
	email: siteConfig.email
};

// Methods :
const toggleContact = () => {
	console.log('toggleContact');
};

const toggleMenu = () => {
	console.log('toggleMenu');
};

// Watchers :
watchEffect(() => {
	hidden.value = scrollHide.value;
});

// Events :
useEventListener('scroll', () => {
	scrollHide.value = window.scrollY > 20;
});
</script>

<template>
	<header
		id="header"
		:class="{ hidden, 'header-dark': globalStore.headerTheme === 'dark' }"
		data-allow-mismatch="class"
	>
		<div class="header-container">
			<Button :to="`/${language}`" class="identity-cta">
				<span>{{ siteConfig.identity }}</span>
			</Button>

			<div class="interactions-container">
				<Button class="contact-cta" @click="toggleContact">
					<span>{{ $t('contactLabel') }}</span>
				</Button>
				<Button class="menu-cta" @click="toggleMenu">
					<span>X</span>
				</Button>
				<Menu :menu="menuConfig" :language="language" :languageAlternates="languageAlternates" />
			</div>
		</div>
	</header>
</template>

<style scoped lang="scss">
#header {
	position: fixed;
	bottom: 0;
	left: 0;
	z-index: 20;
	width: 100%;
	pointer-events: none;
}

.header-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: var(--gutter);

	& > * {
		pointer-events: auto;
	}
}

.identity-cta {
	background-color: $eerieBlack;
	padding: 10px 14px;
	border-radius: 4px;

	span {
		@include roobert-14;

		color: $white;
	}
}

.interactions-container {
	position: relative;
	display: flex;
	align-items: center;

	.contact-cta {
		background-color: $whiteChoco;
		padding: 9px 14px;
		border-radius: 4px;
		padding-inline-end: 54px;

		span {
			@include roobert-14;

			color: $eerieBlack;
		}
	}

	.menu-cta {
		position: absolute;
		right: 0;
		background-color: $eerieBlack;
		padding: 10px 14px;
		border-radius: 4px;
		width: 40px;
		height: 40px;
		aspect-ratio: 1/1;

		span {
			@include roobert-14;

			color: $white;
		}
	}
}
</style>
