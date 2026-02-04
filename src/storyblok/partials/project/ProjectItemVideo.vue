<script setup lang="ts">
import { getLinkAttributes } from '#utils/link.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

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
			<div class="socials-wrapper">
				<div class="socials-sticky-wrapper">
					<template v-for="social in socials" :key="social._uid">
						<li v-if="social.label && getSocialLink(social.label)">
							<a v-bind="getLinkAttributes(getSocialLink(social.label))" @click="trackNavigationClick">
								<LabelShuffle :label="social.label" />
							</a>
						</li>
					</template>
				</div>
			</div>
		</ul>
	</div>
</template>

<style lang="scss" scoped>
.partials-project-item-video {
	position: relative;
	height: fit-content;
}

.socials-container {
	@include mq($until: desktop) {
		margin-block-start: fluidSize(16px, 12px);
	}

	@include mq(desktop) {
		position: absolute;
		bottom: 0;
		right: calc(fluidSize(6px, 4px) * -1);
		transform: translate3d(100%, 0, 0);
		height: 100%;
	}
}

.socials-wrapper {
	position: relative;
	height: 100%;
}

.socials-sticky-wrapper {
	display: flex;

	@include mq($until: desktop) {
		justify-content: flex-end;
		gap: fluidSize(28px, 20px);
	}

	@include mq(desktop) {
		position: sticky;
		top: 80%;
		flex-direction: column;
		gap: fluidSize(8px, 6px);
	}

	li {
		display: flex;
	}

	a {
		@include roobert-12-uppercase;
	}
}
</style>
