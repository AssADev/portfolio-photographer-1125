<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { useEventListener } from '@vueuse/core';
import { ref, watchEffect } from 'vue';

import { getLocale } from '#utils/i18n.ts';

import { $global } from '#stores/global.ts';

const globalStore = useStore($global);

const scrollHide = ref(false);
const hidden = ref(false);

useEventListener('scroll', () => {
	scrollHide.value = window.scrollY > 20;
});

watchEffect(() => {
	hidden.value = scrollHide.value;
});
</script>

<template>
	<header
		id="header"
		:class="{ hidden, 'header-dark': globalStore.headerTheme === 'dark' }"
		data-allow-mismatch="class"
	>
		<div class="container">
			<a :href="`/${getLocale()}`"> Home </a>
			<a :href="`/${getLocale()}/biography`"> Biography </a>
			<a :href="`/${getLocale()}/services`"> Services </a>
			<a :href="`/${getLocale()}/links`"> Links </a>
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

	// pointer-events: none;
}
</style>
