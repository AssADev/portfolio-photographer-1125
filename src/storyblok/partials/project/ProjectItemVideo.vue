<script setup lang="ts">
import { getLinkAttributes } from '#utils/link.ts';

import LabelShuffle from '#components/partials/LabelShuffle.vue';
import Video from '#components/partials/Video.vue';

import type { StoryblokLabelLink, StoryblokProjectItemVideo } from '#types/component-types-sb.js';

// Props :
const props = defineProps<{
	blok: StoryblokProjectItemVideo;
	socials: StoryblokLabelLink[];
}>();

const { blok, socials } = props;

// Methods :
const getSocialLink = (label?: string) => {
	if (!label) return null;
	const key = `link_${label.toLowerCase()}` as keyof typeof blok;
	return blok[key] as any;
};
</script>

<template>
	<div class="partials-project-item-video">
		<Video :video="blok.video" :thumbnail="blok.thumbnail" :link="blok.link_instagram" class="video-container" />
		<ul v-if="socials.length" class="socials-container">
			<template v-for="social in socials" :key="social._uid">
				<li v-if="social.label && getSocialLink(social.label)">
					<a v-bind="getLinkAttributes(getSocialLink(social.label))">
						<LabelShuffle :label="social.label" />
					</a>
				</li>
			</template>
		</ul>
	</div>
</template>

<style lang="scss" scoped>
.partials-project-item-video {
	position: relative;
}

.socials-container {
	position: absolute;
	bottom: 0;
	right: calc(fluidSize(6px, 4px) * -1);
	display: flex;
	flex-direction: column;
	gap: fluidSize(8px, 6px);
	transform: translate3d(100%, 0, 0);

	li {
		display: flex;
	}

	a {
		@include roobert-12-uppercase;
	}
}
</style>
