/** @type {import('stylelint').Config} */
export default {
	customSyntax: 'postcss-html',
	extends: [
		'stylelint-config-recess-order',
		'stylelint-config-standard-scss',
		'stylelint-config-recommended-vue/scss',
		'stylelint-config-css-modules',
		'stylelint-prettier/recommended'
	],
	rules: {
		'custom-property-pattern': null,
		'selector-class-pattern': null,
		'number-max-precision': null,
		'value-keyword-case': null,
		'scss/at-function-pattern': null,
		'scss/dollar-variable-pattern': null,
		'scss/at-extend-no-missing-placeholder': null,
		'scss/load-no-partial-leading-underscore': null,
		'function-name-case': null,
		'at-rule-no-unknown': null,
		'scss/at-rule-no-unknown': true,
		'scss/function-no-unknown': null,
		'function-no-unknown': null,
		'declaration-property-value-no-unknown': null,
		'scss/dollar-variable-empty-line-before': null,
		'media-feature-range-notation': null,
		'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep', 'global', 'export', 'slotted'] }],
		'selector-type-no-unknown': [true, { ignoreTypes: ['astro-island', 'astro-slot'] }]
	},
	overrides: [
		{
			files: ['**/*.scss'],
			customSyntax: 'postcss-scss'
		}
	]
};
