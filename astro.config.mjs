import node from '@astrojs/node';
import vue from '@astrojs/vue';
import { storyblok } from '@storyblok/astro';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig, envField } from 'astro/config';
import autoprefixer from 'autoprefixer';
import { cwd, env } from 'node:process';
import { loadEnv } from 'vite';
import svgLoader from 'vite-svg-loader';

import storyblokLocales from './integrations/storyblokLocales';

// Automatically map Storyblok components to their corresponding Astro components
// This creates an object where keys are component names and values are their file paths
const storyblokComponents = Object.fromEntries(
	Object.keys(
		import.meta.glob('./src/storyblok/**/*.astro', {
			query: 'url',
			eager: true,
			import: 'default'
		})
	).map((path) => {
		const match = path.match(/\/src\/storyblok\/(.+?)\.astro$/);
		return match ? [match[1].split('/').pop(), `storyblok/${match[1]}`] : [];
	})
);

// Load environment variables based on current NODE_ENV :
const { SITE_URL, STORYBLOK_TOKEN, PREVIEW_HOSTS } = loadEnv(env.NODE_ENV, cwd(), '');

export default defineConfig({
	// Set the site URL from environment variables :
	site: SITE_URL,
	// Configure integrations :
	integrations: [
		storyblok({
			accessToken: STORYBLOK_TOKEN,
			apiOptions: { cache: { clear: 'auto', type: 'memory' } },

			// Map Storyblok components to Astro components :
			components: storyblokComponents,
			enableFallbackComponent: true,
			customFallbackComponent: 'storyblok/Fallback',

			// Disabled to toggle at runtime on specific header :
			livePreview: false,

			// Disabled to toggle at runtime on specific header :
			bridge: false
		}),
		// Custom integration to handle Storyblok locales :
		storyblokLocales({
			accessToken: STORYBLOK_TOKEN,
			filepath: './src/utils/locales.json',
			translationsFolder: './src/assets/locales/'
		}),
		vue({ appEntrypoint: '/src/scripts/_vueApp.ts', devtools: false })
	],
	// Configure server-side rendering :
	output: 'server',
	adapter: node({ mode: 'standalone' }),

	// Define environment variable schema :
	env: {
		schema: {
			PREVIEW_HOSTS: envField.string({
				context: 'server',
				access: 'public',
				optional: true
			}),

			STORYBLOK_TOKEN: envField.string({ context: 'server', access: 'secret' }),
			STORYBLOK_SPACE_ID: envField.number({
				context: 'server',
				access: 'secret'
			}),
			STORYBLOK_ASSETS_DOMAIN: envField.string({
				context: 'server',
				access: 'public',
				default: 'a2.storyblok.com',
				optional: true
			}),

			SITE_URL: envField.string({ context: 'client', access: 'public' })
		}
	},

	// Vite configuration :
	vite: {
		plugins: [
			basicSsl(),
			svgLoader({
				svgoConfig: {
					plugins: [
						{
							name: 'preset-default',
							params: { overrides: { removeViewBox: false, cleanupIds: false } }
						},
						{
							name: 'addAttributesToSVGElement',
							params: {
								attributes: [{ focusable: 'false', 'aria-hidden': 'true' }]
							}
						}
					]
				}
			})
		],
		css: {
			postcss: {
				plugins: [autoprefixer({})]
			},
			preprocessorOptions: {
				scss: {
					api: 'modern-compiler',
					additionalData: (source, id) => {
						let prepend = '';

						// Avoid circule module loop :
						if (!id.endsWith('.module.scss') && !id.endsWith('app.scss')) {
							prepend += `@use "#styles/tools" as *;`;
						}

						return prepend + source;
					}
				}
			}
		},
		build: {
			cssCodeSplit: false
		}
	}
});
