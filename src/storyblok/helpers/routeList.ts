import { getRoutePathsFromLinks, getStoryblokLinks } from './getStoryblokLinks';

export const updateRouteList = async () => {
	const links = await getStoryblokLinks();
	const routeList = getRoutePathsFromLinks(links);

	return routeList;
};

export const getRouteList = async () => {
	const updated = await updateRouteList();

	return updated;
};
