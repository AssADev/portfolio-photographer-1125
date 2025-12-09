import bp from '#styles/modules/breakpoints.module.scss';

export function mapSortBreakpoints<T extends Record<string, string>>(breakpoints: T) {
	return Object.entries(breakpoints)
		.map(([key, value]) => [key, Number.parseInt(value.replace(/\D/g, ''))] as const)
		.sort(([, a], [, b]) => b - a) as [keyof T, number][];
}

export type BreakpointKey = 'large-mobile' | 'tablet' | 'desktop' | 'mlarge' | 'large' | 'xlarge' | 'xxlarge';
export type Breakpoints = Record<BreakpointKey, string>;

export const breakpoints = bp as Breakpoints;
export const breakPointsNoUnits = Object.fromEntries(
	Object.entries(breakpoints).map(([key, value]) => [key, Number.parseInt(value.replace(/\D/g, ''))])
) as Record<BreakpointKey, number>;
export const sortedBreakpoints = mapSortBreakpoints(breakpoints);
