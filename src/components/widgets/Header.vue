<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { useEventListener } from '@vueuse/core';
import { provide, ref, watchEffect } from 'vue';

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
provide('siteConfig', siteConfig);
const globalStore = useStore($global);

const scrollHide = ref(false);
const hidden = ref(false);

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
				<Menu :language="language" :languageAlternates="languageAlternates" />
			</div>
		</div>
	</header>
</template>

<style scoped lang="scss">
#header {
	--header-height: 40px;
	--padding-inline: 14px;

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
}

.identity-cta {
	background: $eerieBlack;
	padding-inline: var(--padding-inline);
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

	.contact-cta {
		background: $whiteChoco;
		padding-inline: var(--padding-inline);
		border-radius: var(--border-radius);
		padding-inline-end: 54px;

		span {
			@include roobert-14-uppercase;

			color: $eerieBlack;
		}
	}

	.menu-cta {
		position: absolute;
		right: 0;
		background: $eerieBlack;
		border-radius: var(--border-radius);
		aspect-ratio: 1/1;

		span {
			@include roobert-14-uppercase;

			color: $white;
		}
	}
}
</style>
