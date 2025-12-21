import type { StoryblokAsset } from '#types/component-types-sb.js';

let isFetched = false;
let imagesCache: StoryblokAsset[] = [];

// Utils :
const fisherYatesShuffle = (arr: StoryblokAsset[]): StoryblokAsset[] => {
	const shuffled = [...arr];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

const ensureNoAdjacentDuplicates = (arr: StoryblokAsset[]): StoryblokAsset[] => {
	if (arr.length <= 1) return arr;

	let result = [...arr];
	let hasAdjacent = true;

	while (hasAdjacent) {
		hasAdjacent = false;
		for (let i = 0; i < result.length - 1; i++) {
			if (result[i].filename === result[i + 1].filename) {
				hasAdjacent = true;
				let swapIdx;
				let attempts = 0;
				do {
					swapIdx = Math.floor(Math.random() * result.length);
					attempts++;
				} while (
					(swapIdx === i || swapIdx === i + 1 || result[swapIdx].filename === result[i].filename) &&
					attempts < 20
				);

				if (attempts < 20) {
					[result[i + 1], result[swapIdx]] = [result[swapIdx], result[i + 1]];
				}
				break;
			}
		}
	}

	return result;
};

const fetchFromStoryblok = async (endpoint: string, spaceId: string, token: string): Promise<any> => {
	const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${spaceId}/${endpoint}`, {
		method: 'GET',
		headers: {
			Authorization: token,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`API error: ${response.status}`);
	}

	return response.json();
};

// Methods :
export const fetchProjectImagesServer = async (): Promise<StoryblokAsset[]> => {
	if (isFetched && imagesCache.length > 0) return imagesCache;

	try {
		const spaceId = import.meta.env.STORYBLOK_SPACE_ID;
		const token = import.meta.env.STORYBLOK_OAUTH_TOKEN;
		const folderName = '[Pages] Projects';

		if (!spaceId || !token) {
			throw new Error('Missing STORYBLOK_SPACE_ID or STORYBLOK_OAUTH_TOKEN');
		}

		// Get all folders :
		const foldersData = await fetchFromStoryblok('asset_folders', spaceId, token);
		const folders = foldersData.asset_folders || [];

		const projectFolder = folders.find((folder: any) => folder.name === folderName);

		if (!projectFolder) {
			console.warn(`Folder "${folderName}" not found`);
			return [];
		}

		// Get all assets of the desired folder :
		const assetsData = await fetchFromStoryblok(`assets?in_folder=${projectFolder.id}`, spaceId, token);

		const assets = assetsData.assets || [];

		if (assets.length === 0) {
			console.warn(`No images found in folder "${folderName}"`);
			return [];
		}

		// Shuffle the assets :
		const projectImages = assets.map((asset: any) => asset);

		const shuffled = fisherYatesShuffle(projectImages);
		// shuffled = ensureNoAdjacentDuplicates(shuffled);

		imagesCache = shuffled;
		isFetched = true;

		return imagesCache;
	} catch (err) {
		console.error('Error fetching Storyblok images:', err);
		return [];
	}
};

export const getProjectImages = () => ({
	images: imagesCache
});
