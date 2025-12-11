<script setup lang="ts">
import type { ISbStoryData } from '@storyblok/vue';
import { type Component, useTemplateRef } from 'vue';

/**
 * https://vuejs.org/api/sfc-script-setup.html#recursive-components
 * Recursive Components
 *
 * An SFC can implicitly refer to itself via its filename.
 * E.g. a file named FooBar.vue can refer to itself as <FooBar/> in its template.
 */

interface Props {
	blok: ISbStoryData['content'];
	components: Record<string, Component>;
}

const { blok, components } = defineProps<Props>();

const ResolvedComponent = blok.component && components[blok.component] ? components[blok.component] : null;

// Find nested component arrays (e.g. "body", "items", etc.) :
const childrenKeys = Object.keys(blok).filter(
	(key) => (Array.isArray(blok[key]) && blok[key].some((item: any) => item?.component)) || blok[key]?.component
);

const child = useTemplateRef<any>('child');
defineExpose({ child });
</script>

<template>
	<component :is="ResolvedComponent" v-if="ResolvedComponent && blok" ref="child" :key="blok._uid" :blok="blok">
		<template v-if="childrenKeys.length" #default="props">
			<template v-for="key in childrenKeys" :key="key">
				<template v-if="Array.isArray(blok[key])">
					<StoryblokComponent
						v-for="item in blok[key]"
						:key="item._uid"
						:blok="item"
						:components
						v-bind="props"
					/>
				</template>
				<StoryblokComponent v-else :key="blok[key]._uid" :blok="blok[key]" :components v-bind="props" />
			</template>
		</template>
	</component>
</template>
