#!/usr/bin/env node
import { log } from 'node:console';
import { mkdirSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { argv, cwd, exit } from 'node:process';

// Get command line arguments :
const [, , componentName, componentType = 'modules'] = argv;

if (!componentName) {
	console.error('Please provide a component name');
	exit(1);
}

// Define paths :
const rootDir = cwd();
const vueComponentPath = join(rootDir, 'src/storyblok', componentType, `${componentName}.vue`);
const astroComponentPath = join(rootDir, 'src/storyblok', componentType, `${componentName}.astro`);

// Generate Vue component content :
const vueContent = `<script setup lang="ts">
import type { Storyblok${componentName} } from '#types/component-types-sb.js';

defineProps<{
	blok: Storyblok${componentName};
}>();
</script>

<template><div>${componentName}</div></template>

<style lang="scss" scoped>
div {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60vh;
	border: 1px solid red;
}
</style>
`;

// Generate Astro component content :
const astroContent = `---
import { storyblokEditable } from '#storyblok/helpers/storyblokEditable.ts';
import ${componentName}Vue from '#storyblok/${componentType}/${componentName}.vue';
import type { Storyblok${componentName} } from '#types/component-types-sb.js';

type Props = {
	blok: Storyblok${componentName};
};

const { blok } = Astro.props;
---

<${componentName}Vue {...storyblokEditable(blok, Astro.locals.isPreviewMode)} {...Astro.props} />
`;

// Create directories if they don't exist :
mkdirSync(path.dirname(vueComponentPath), { recursive: true });
mkdirSync(path.dirname(astroComponentPath), { recursive: true });

// Write files
writeFileSync(vueComponentPath, vueContent);
writeFileSync(astroComponentPath, astroContent);

log(`Created Vue component at: ${vueComponentPath}`);
log(`Created Astro component at: ${astroComponentPath}`);
