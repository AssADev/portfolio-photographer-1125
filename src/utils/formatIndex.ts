export const formatIndex = (index: number | string) => {
	if (typeof index === 'number') {
		return index < 10 ? `0${index}` : index.toString();
	}
	return index.toString();
};
