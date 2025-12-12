<script setup lang="ts">
import CursorProjects from '#components/partials/CursorProjects.vue';
import CircularStar from '#components/utils/CircularStar.vue';
import Label from '#components/utils/Label.vue';
import RichText from '#components/utils/RichText.vue';

import type { StoryblokBiographyCopyright } from '#types/component-types-sb.js';

// Props :
defineProps<{
	blok: StoryblokBiographyCopyright;
}>();
</script>

<template>
	<section class="modules biography-copyright">
		<CursorProjects v-if="blok.cursorProjects" :isAtBottom="true" />
		<CircularStar />
		<div class="container">
			<Label v-if="blok.label" :label="blok.label" />
			<RichText :doc="blok.title" />
		</div>
	</section>
</template>

<style lang="scss" scoped>
.biography-copyright {
	@include pseudo-gradient('before', 'bottom', 'white-ivory-transparent', 1, fluidSize(360px, 280px));

	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	overflow: hidden;

	:deep(.partials-circular-star) {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translate3d(-50%, 50%, 0);

		@include mq($until: desktop) {
			height: 100%;
		}

		@include mq(desktop) {
			width: var(--ctn-w);
		}
	}
}

.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	max-width: fluidSize(780px, 540px);
	text-align: center;

	@include mq($until: tablet) {
		gap: 8px;
	}

	@include mq(tablet) {
		gap: 4px;
	}

	& > :deep(.partials-rich-text) {
		@include roobert-48;

		em {
			@include romie-48-italic;
		}
	}
}
</style>
