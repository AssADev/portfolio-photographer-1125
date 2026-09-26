type State = Record<string, unknown>;

type StateStorage = { getStore: () => State | undefined };

/**
 * Used in the browser (and as a fallback on the server) :
 */
const fallbackState: State = {
	language: 'fr'
};

/**
 * On the server, several requests can be rendered at the same time by the same instance,
 * so each request gets its own state (an AsyncLocalStorage created in `src/middleware.ts`).
 * Otherwise, a page could be rendered (and cached) with the language of another request.
 */
const getStore = (): State => {
	if (!import.meta.env.SSR) return fallbackState;

	const storage = (globalThis as { __astroStateStorage?: StateStorage }).__astroStateStorage;
	return storage?.getStore() ?? fallbackState;
};

export const getState = (key: string, valueIfMissing?: unknown) => {
	const state = getStore();
	if (key in state) return state[key];
	return valueIfMissing;
};

export const setState = (key: string, value: unknown): void => {
	getStore()[key] = value;
};
