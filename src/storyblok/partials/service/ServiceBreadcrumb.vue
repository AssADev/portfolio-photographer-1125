<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import LabelShuffle from '#components/partials/LabelShuffle.vue';
import Button from '#components/utils/Button.vue';

// Types :
interface BreadcrumbItem {
	id: string;
	prop: keyof typeof props;
	i18nKey: string;
}

// Props :
const props = defineProps<{
	hasTestimonials?: boolean;
	hasOffers?: boolean;
	hasFAQ?: boolean;
}>();

// Variables :
const PREFIX = 'service-';

const buttons: BreadcrumbItem[] = [
	{ id: 'testimonials', prop: 'hasTestimonials', i18nKey: 'breadcrumbTestimonials' },
	{ id: 'offers', prop: 'hasOffers', i18nKey: 'breadcrumbOffers' },
	{ id: 'faq', prop: 'hasFAQ', i18nKey: 'breadcrumbQuestions' }
];

// Refs :
const lenis = useLenis();
const activeSection = ref<string | null>(null);

// Computed :
const isVisible = computed(() => props.hasTestimonials || props.hasOffers || props.hasFAQ);

const visibleButtons = computed(() => {
	return buttons.filter((button) => props[button.prop]);
});

// Methods :
const getTargetId = (id: string) => `${PREFIX}${id}`;

const scrollTo = (id: string) => {
	if (!lenis.value) return;
	lenis.value.scrollTo(`#${getTargetId(id)}`, { offset: -60, duration: 1.25 });
};

// ScrollTrigger :
const initScrollTriggers = () => {
	visibleButtons.value.forEach((button) => {
		const targetId = getTargetId(button.id);

		ScrollTrigger.create({
			trigger: `#${targetId}`,
			start: 'top center',
			end: 'bottom center',
			onToggle: (self) => {
				activeSection.value = self.isActive ? targetId : null;
			}
		});
	});
};

// Attach :
onMounted(() => {
	initScrollTriggers();
});

onUnmounted(() => {
	ScrollTrigger.getAll().forEach((trigger) => {
		const triggerId = trigger.trigger?.id;
		if (triggerId && triggerId.startsWith(PREFIX)) trigger.kill();
	});
});
</script>

<template>
	<div v-if="isVisible" class="partials-service-breadcrumb">
		<Button
			v-for="button in visibleButtons"
			:key="button.id"
			:class="{ active: activeSection === getTargetId(button.id) }"
			@click="scrollTo(button.id)"
		>
			<LabelShuffle :label="$t(button.i18nKey)" no-snap />
		</Button>
	</div>
</template>

<style scoped lang="scss">
.partials-service-breadcrumb {
	position: fixed;
	z-index: 20;
	top: var(--gutter);
	left: var(--gutter);
	display: flex;
	align-items: center;
	gap: 14px;
	background: $eerieBlack;
	height: var(--header-height);
	border-radius: var(--border-radius);
	padding-inline: var(--header-padding-inline);
}

:deep(button) {
	display: flex;
	align-items: center;
	justify-content: center;
	color: $grey;
	transition: color 0.4s $power2Out;

	@include hover {
		color: $white;
	}

	&.active {
		color: $white;
		pointer-events: none;
	}

	span {
		@include roobert-14-uppercase;
	}
}
</style>
