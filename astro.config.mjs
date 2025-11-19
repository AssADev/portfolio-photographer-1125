// @ts-check
import node from '@astrojs/node';
import vue from '@astrojs/vue';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'astro/config';
import autoprefixer from 'autoprefixer';
import svgLoader from 'vite-svg-loader';

export default defineConfig({
	integrations: [vue({ appEntrypoint: '/src/scripts/_vueApp.ts', devtools: false })],
	// Configure server-side rendering :
	output: 'server',
	adapter: node({ mode: 'standalone' }),

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
						if (!id.endsWith('.module.scss') && !id.endsWith('globals/index.scss'))
							prepend += `@use "#styles/tools" as *;`;

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
