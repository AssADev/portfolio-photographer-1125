const state: Record<string, unknown> = {
	language: 'fr'
};

export const getState = (key: string, valueIfMissing?: unknown) => {
	if (key in state) {
		return state[key];
	}
	return valueIfMissing;
};

export const setState = (key: string, value: unknown): void => {
	state[key] = value;
};
