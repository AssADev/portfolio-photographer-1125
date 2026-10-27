import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintPluginVueAccessibility from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		ignores: ['src/types/**/*', 'node_modules/**/*', '.astro/**/*', '.storyblok/**/*', 'dist/**/*']
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
			'vue/no-v-html': 'off',
			// Optional props typed with TS (`prop?: T`) are already `T | undefined` :
			'vue/require-default-prop': 'off'
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
	{
		rules: {
			'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
			'vuejs-accessibility/anchor-has-content': [
				'error',
				{ accessibleChildren: ['LabelShuffle', 'LabelName', 'RichText'] }
			]
		}
	},
	// Prettier integration (MUST BE LAST) :
	eslintConfigPrettier,
	{
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
			'no-unused-vars': 'off',
			'no-undef': 'off'
		}
	}
];
