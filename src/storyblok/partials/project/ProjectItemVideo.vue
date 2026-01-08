<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue';

import { getLinkAttributes } from '#utils/link.ts';

import LabelShuffle from '#components/partials/LabelShuffle.vue';
import Button from '#components/utils/Button.vue';

import type { StoryblokLabelLink, StoryblokProjectItemVideo } from '#types/component-types-sb.js';

// Props :
const props = defineProps<{
	blok: StoryblokProjectItemVideo;
	socials: StoryblokLabelLink[];
}>();

const { blok, socials } = props;

// Refs :
const videoRef = useTemplateRef<HTMLVideoElement>('videoRef');

// Variables :
let observer: IntersectionObserver | null = null;

// Methods :
const playVideo = () => {
	if (!videoRef.value) return;
	videoRef.value.play();
};

const pauseVideo = () => {
	if (!videoRef.value) return;
	videoRef.value?.pause();
};

const createObserver = () => {
	if (!videoRef.value) return;

	observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				entry.isIntersecting ? playVideo() : pauseVideo();
			});
		},
		{
			root: null,
			rootMargin: '0px',
			threshold: 0
		}
	);

	observer.observe(videoRef.value);
};

const getSocialLink = (label?: string) => {
	if (!label) return null;
	const key = `link_${label.toLowerCase()}` as keyof typeof blok;
	return blok[key] as any;
};

// Attach :
onMounted(() => {
	createObserver();
});

onUnmounted(() => {
	observer?.disconnect();
});
</script>

<template>
	<div class="partials-project-item-video">
		<Button
			v-if="blok.thumbnail.filename && blok.video.filename"
			is="a"
			v-bind="getLinkAttributes(blok.link_instagram)"
			:aria-label="$t('watchVideo')"
			:data-cursor-label="$t('watchVideo')"
			class="video-container"
		>
			<video
				ref="videoRef"
				:poster="blok.thumbnail.filename"
				:src="blok.video.filename"
				loop
				muted
				playsinline
			></video>
		</Button>
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

.video-container {
	display: block;
	aspect-ratio: 350 / 620;
	overflow: hidden;
}

video {
	@include img-fill;
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
