import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueAccessibility from 'eslint-plugin-vuejs-accessibility';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		ignores: ['src/types/**/*', 'node_modules/**/*', '.astro/**/*']
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,vue,astro}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				Astro: 'readonly'
			}
		}
	},
	// Base recommended :
	...tseslint.configs.recommended,
	// Vue configuration :
	...eslintPluginVue.configs['flat/recommended'],
	{
		files: ['**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		},
		rules: {
			'vue/multi-word-component-names': 'off',
			'vue/no-v-html': 'off'
		}
	},
	// Astro configuration :
	...eslintPluginAstro.configs.recommended,
	{
		files: ['**/*.astro'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.astro']
			}
		}
	},
	// Accessibility for Vue :
	...eslintPluginVueAccessibility.configs['flat/recommended'],
	// Prettier integration (MUST BE LAST) :
	eslintConfigPrettier,
	{
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'no-unused-vars': 'off',
			'no-undef': 'off'
		}
	}
];
