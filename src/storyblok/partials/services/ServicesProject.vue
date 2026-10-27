<script setup lang="ts">
import { trackNavigationClick } from '#utils/tracking.ts';

import LabelName from '#components/utils/LabelName.vue';

import type { StoryblokRichtext } from '#types/component-types-sb.js';

// Props :
defineProps<{
	url: string;
	title: StoryblokRichtext;
	cursorLabel?: string;
	hoverScale?: number;
}>();
</script>

<template>
	<a
		v-animate="{ type: 'mask-reveal', options: { direction: 'down', start: 'top 110%' } }"
		:href="url"
		class="partials-services-project"
		:data-cursor-label="cursorLabel || $t('discoverProject')"
		:style="{ '--hover-scale': hoverScale || 1.0175 }"
		@click="trackNavigationClick"
	>
		<div class="picture-wrapper">
			<picture>
				<slot name="image" />
			</picture>
		</div>
		<div class="content-container">
			<LabelName v-animate="{ type: 'reveal-button-dot', options: { start: 'top 110%' } }" :name="title" />
			<div v-if="$slots.info" class="informations-wrapper">
				<slot name="info" />
			</div>
		</div>
	</a>
</template>

<style lang="scss" scoped>
.partials-services-project {
	position: relative;
	display: block;
	width: 100%;
	height: 100%;
	overflow: hidden;

	@include hover {
		.picture-wrapper {
			transform: scale3d(var(--hover-scale), var(--hover-scale), 1);
		}
	}

	.picture-wrapper {
		height: 100%;
		transition: transform 0.8s $power2Out;
	}

	:deep(img) {
		@include img-fill;
	}
}

.content-container {
	position: absolute;
	bottom: 0;
	left: 0;
	display: flex;
	gap: 10px;
	width: 100%;
	padding: var(--gutter);

	@include mq($until: tablet) {
		flex-direction: column;
	}

	@include mq(tablet) {
		align-items: center;
		justify-content: space-between;
	}

	& > :deep(.partials-label-name) {
		position: relative;
		bottom: auto;
		left: auto;
	}
}

.informations-wrapper {
	display: flex;
	gap: 10px;
	align-items: center;
}

:slotted(.informations-label) {
	position: relative;
	padding: fluidSize(5px, 2px) 8px fluidSize(7px, 6px);
	overflow: hidden;
	color: $white;
	background: $eerieBlack;
	border-radius: 3px;

	span {
		@include roobert-14-uppercase;

		display: flex;
		text-wrap: nowrap;
	}
}
</style>
