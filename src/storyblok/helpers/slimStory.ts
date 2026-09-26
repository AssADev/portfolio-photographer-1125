import type { ISbStoryData } from '@storyblok/astro';

/**
 * Helpers used to reduce the size of the props sent to the Vue islands.
 *
 * Every prop given to a `client:*` component is serialized in the HTML. As relations are resolved by Storyblok,
 * a project contains its full service (with all its modules), a link contains its full story, etc.
 * Without slimming, some pages weighted more than 20 MB of HTML.
 */

type AnyRecord = Record<string, unknown>;

const isObject = (value: unknown): value is AnyRecord => !!value && typeof value === 'object';

/**
 * A resolved story (relation or link) always has an uuid, a full slug and a content :
 */
const isStory = (value: unknown): value is ISbStoryData =>
	isObject(value) && typeof value.uuid === 'string' && typeof value.full_slug === 'string' && isObject(value.content);

/**
 * Remove the undefined keys of an object :
 */
const compact = <T extends AnyRecord>(object: T) =>
	Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as T;

/**
 * Story metadata used by the client components :
 */
const pickStoryMeta = (story: ISbStoryData) =>
	compact({
		id: story.id,
		uuid: story.uuid,
		name: story.name,
		slug: story.slug,
		full_slug: story.full_slug
	});

/**
 * Asset fields used by the client components (images, videos, files) :
 */
const slimAsset = (asset: AnyRecord) =>
	Object.fromEntries(
		Object.entries({
			id: asset.id,
			filename: asset.filename,
			alt: asset.alt,
			title: asset.title,
			focus: asset.focus,
			fieldtype: asset.fieldtype,
			assetType: asset.assetType
		}).filter(([, value]) => value !== undefined && value !== null && value !== '')
	);

/**
 * Lightweight version of a story resolved in a link (only what is needed to build the link or open a form) :
 */
const slimLinkedStory = (story: ISbStoryData) => ({
	...pickStoryMeta(story),
	content: compact({ component: story.content.component, id: story.content.id })
});

/**
 * Lightweight version of a related story (project, service...) : its metadata and its `informations` block,
 * which is all the client components use to display cards, labels and links.
 */
export function slimStory<T>(story: T): T {
	if (!isStory(story)) return story;

	const { component, _uid, informations } = story.content;

	return {
		...pickStoryMeta(story),
		content: compact({ component, _uid, informations: slimRelations(informations) })
	} as T;
}

/**
 * Same as `slimStory`, but keeps the whole content (e.g. for the forms, which are fully rendered).
 */
export function slimStoryMeta<T>(story: T): T {
	if (!isStory(story)) return story;

	return { ...pickStoryMeta(story), content: slimRelations(story.content) } as T;
}

/**
 * Only keeps what is needed to filter / count projects by service :
 */
export function slimProjectForFilter<T>(project: T): T {
	if (!isStory(project)) return project;

	const services = (project.content.informations?.[0]?.service ?? []) as (ISbStoryData | string)[];

	return {
		id: project.id,
		uuid: project.uuid,
		content: {
			component: project.content.component,
			informations: [
				{
					service: services.map((service) =>
						typeof service === 'string' ? service : { uuid: service.uuid, slug: service.slug }
					)
				}
			]
		}
	} as T;
}

/**
 * Deep copy of a value where every nested story (relation or link) is replaced by its lightweight version,
 * and the Storyblok editable comments are removed (they are only needed on the root bloks, server side).
 */
export function slimRelations<T>(value: T): T {
	if (Array.isArray(value)) return value.map((item) => slimRelations(item)) as T;
	if (!isObject(value)) return value;
	if (isStory(value)) return slimStory(value);
	if (value.fieldtype === 'asset') return slimAsset(value) as T;

	const result: AnyRecord = {};

	for (const [key, item] of Object.entries(value)) {
		if (key === '_editable') continue;
		result[key] = key === 'story' && isStory(item) ? slimLinkedStory(item) : slimRelations(item);
	}

	return result as T;
}
