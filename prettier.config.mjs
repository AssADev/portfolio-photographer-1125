/** @type {import("prettier").Config} */
export default {
	plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-astro'],
	overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
	printWidth: 120,
	tabWidth: 4,
	useTabs: true,
	semi: true,
	singleQuote: true,
	trailingComma: 'none',
	bracketSpacing: true,
	bracketSameLine: false,
	importOrder: [
		'^#extensions(.*)$',
		'^#utils(.*)$',
		'^#components(.*)$',
		'^#types(.*)$',
		'^#styles(.*)$',
		'^#assets(.*)$',
		'^#(.*)$',
		'^[./]'
	],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true
};
