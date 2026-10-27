<script setup lang="ts">
import { getLinkAttributes } from '#utils/link.ts';
import { trackNavigationClick } from '#utils/tracking.ts';

import LabelShuffle from '#components/partials/LabelShuffle.vue';
import VideoPreview from '#components/partials/Video.vue';

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
	const key = `link_${label.toLowerCase()}` as 'link_instagram' | 'link_tiktok';
	return blok[key] ?? null;
};
</script>

<template>
	<div class="partials-project-item-video">
		<VideoPreview
			v-animate="{ type: 'mask-reveal', options: { direction: 'down', start: 'top 120%' } }"
			:video="blok.video"
			:thumbnail="blok.thumbnail"
			:link="blok.link_instagram"
			class="video-container"
		/>
		<div v-if="socials.length" class="socials-container">
			<div class="socials-wrapper">
				<ul class="socials-sticky-wrapper">
					<template v-for="(social, index) in socials" :key="social._uid">
						<li v-if="social.label && getSocialLink(social.label)">
							<a
								:href="getSocialLink(social.label)?.url"
								v-bind="getLinkAttributes(getSocialLink(social.label))"
								@click="trackNavigationClick"
							>
								<LabelShuffle
									v-animate="{
										type: 'reveal-label-shuffle',
										options: { delay: 0.65 + index * 0.15 }
									}"
									:label="social.label"
									reveal
								/>
							</a>
						</li>
					</template>
				</ul>
			</div>
		</div>
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
		right: calc(fluidSize(6px, 4px) * -1);
		bottom: 0;
		height: 100%;
		transform: translate3d(100%, 0, 0);
	}
}

.socials-wrapper {
	position: relative;
	height: 100%;
}

.socials-sticky-wrapper {
	display: flex;

	@include mq($until: desktop) {
		gap: fluidSize(28px, 20px);
		justify-content: flex-end;
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
