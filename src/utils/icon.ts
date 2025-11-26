import type { AsyncComponentLoader } from 'vue';

export const ICONS: Record<string, { svg: AsyncComponentLoader; gradient: boolean }> = Object.fromEntries(
	Object.entries({
		...import.meta.glob('../assets/svg/icons/*.svg', {
			query: 'component',
			eager: false,
			import: 'default'
		}),
		...import.meta.glob('../assets/svg/icons-gradient/*.svg', {
			query: 'component',
			eager: false,
			import: 'default'
		}),
		...import.meta.glob('../assets/svg/flags/*.svg', {
			query: 'component',
			eager: false,
			import: 'default'
		})
	}).map(([path, svg]) => [
		path.split('/').pop()?.split('.').shift(),
		{ svg, gradient: path.includes('icons-gradient') }
	])
);
