<script setup lang="ts">
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { computed, inject, nextTick, ref, useTemplateRef, watch } from 'vue';

import { animations } from '#utils/Animations.ts';
import { formatIndex } from '#utils/formatIndex.ts';
import { nl2br } from '#utils/nl2br.ts';

import DrawerMenu from '#components/partials/DrawerMenu.vue';
import Form from '#components/partials/Form.vue';
import Button from '#components/utils/Button.vue';

// Injections :
const siteConfig = inject<any>('siteConfig');

// Props & Model :
const { language, formId } = defineProps<{
	language: string;
	formId?: string;
}>();

const toggled = defineModel<boolean>('toggled', { default: false });

const { titleContact, descriptionContact, formsContact } = siteConfig;

// Refs :
const showTransition = ref(true);
const drawerMenuRef = ref<any>(null);
const selectedForm = ref<any | null>(null);
const formStatus = ref<'idle' | 'success' | 'error'>('idle');

const closeLabelRef = useTemplateRef('closeLabelRef');

const titleRef = useTemplateRef('titleRef');
const descriptionRef = useTemplateRef('descriptionRef');
const formsRef = useTemplateRef('formsRef');

let tl: gsap.core.Timeline | null = null;

// Computed :
const forms = computed(() => {
	return formsContact || [];
});

const currentTitle = computed(() => {
	if (selectedForm.value) {
		if (formStatus.value === 'success') return selectedForm.value.content.formSuccess[0].title;
		if (formStatus.value === 'error') return selectedForm.value.content.formError[0].title;
		return selectedForm.value.content.title;
	}
	return titleContact;
});

const currentDescription = computed(() => {
	if (selectedForm.value) {
		if (formStatus.value !== 'idle') return '';
		return selectedForm.value.content.description;
	}
	return descriptionContact;
});

// Methods :
const openForm = (form: any) => {
	selectedForm.value = form;
	formStatus.value = 'idle';
};

const backToChoices = () => {
	selectedForm.value = null;
	formStatus.value = 'idle';
};

const onFormStatusChange = (status: 'idle' | 'success' | 'error') => {
	formStatus.value = status;
};

const closeDrawer = () => {
	toggled.value = false;
	formStatus.value = 'idle';
	selectedForm.value = null;
	showTransition.value = true;
};

// Watchers :
watch(toggled, async (val) => {
	if (val) {
		await nextTick();
		if (closeLabelRef.value) {
			animations['reveal-letters-speed'](closeLabelRef.value, { delay: 0.4 });
		}
	}
});

watch(
	() => formId,
	async (newId) => {
		if (newId) {
			const found = forms.value.find((f: any) => f.content.id === newId);
			if (found) {
				showTransition.value = false;
				selectedForm.value = found;
				formStatus.value = 'idle';
				await nextTick();
				showTransition.value = true;
			}
		}
	},
	{ immediate: true }
);

// Animatinon :
const onOpen = () => {
	tl?.kill();
	tl = gsap.timeline();

	if (titleRef.value) tl.add(animations['reveal-paragraphs'](titleRef.value, { delay: 0.45 }), 0);
	if (descriptionRef.value) tl.add(animations['reveal-paragraphs'](descriptionRef.value, { delay: 0.475 }), 0);

	formsRef.value?.forEach((form: any, index: number) => {
		const reverseIndex = formsRef.value!.length - 1 - index;

		const title = form.querySelector('.title');
		const number = form.querySelector('.number');
		const description = form.querySelector('.description');

		tl!.add(animations['reveal-paragraphs'](title, { delay: 0.125 + reverseIndex * 0.1 }), 0);
		tl!.add(animations['reveal-letters'](number, { delay: 0.2 + reverseIndex * 0.1 }), 0);
		tl!.add(animations['reveal-paragraphs'](description, { delay: 0.2 + reverseIndex * 0.1 }), 0);
	});

	return tl;
};

const onButtonLeave = (el: any, done: () => void) => {
	const label = el.querySelector('span');
	label ? animations['hide-letters-speed'](label, { onComplete: done }) : done();
};

const onButtonEnter = (el: any, done: () => void) => {
	const label = el.querySelector('span');
	label ? animations['reveal-letters-speed'](label, { onComplete: done }) : done();
};

// Expose :
defineExpose({
	onOpen,
	drawerRef: computed(() => drawerMenuRef.value?.drawerRef),
	openDrawer: () => drawerMenuRef.value?.openDrawer(),
	closeDrawer: () => drawerMenuRef.value?.closeDrawer()
});
</script>

<template>
	<DrawerMenu
		ref="drawerMenuRef"
		v-model:toggled="toggled"
		theme="light"
		:has-error="formStatus === 'error'"
		:prevent-click-outside="!!selectedForm && formStatus !== 'success'"
		@close="closeDrawer"
	>
		<template #title>
			<transition v-if="showTransition" name="fade" mode="out-in">
				<div :key="selectedForm ? selectedForm.content.id : 'default'" class="text-container">
					<p ref="titleRef" class="title">{{ currentTitle }}</p>
					<p
						v-if="currentDescription"
						ref="descriptionRef"
						class="description"
						v-html="nl2br(currentDescription)"
					></p>
				</div>
			</transition>
			<div v-else class="text-container">
				<p class="title">{{ currentTitle }}</p>
				<p v-if="currentDescription" class="description" v-html="nl2br(currentDescription)"></p>
			</div>
		</template>
		<div class="content-container">
			<transition v-if="showTransition" name="fade" mode="out-in">
				<div v-if="selectedForm" class="form-detail">
					<Form :form="selectedForm" :language="language" @status="onFormStatusChange" />
				</div>
				<ul v-else class="forms-container">
					<li v-for="(form, index) in forms" :key="form.content.id" ref="formsRef">
						<Button @click="openForm(form)">
							<div class="title-wrapper">
								<p class="title">{{ form.content.title }}</p>
								<span class="number">/{{ formatIndex(Number(index) + 1) }}</span>
							</div>
							<p class="description" v-html="nl2br(form.content.description)"></p>
						</Button>
					</li>
				</ul>
			</transition>
			<div v-else>
				<div v-if="selectedForm" class="form-detail">
					<Form :form="selectedForm" :language="language" @status="onFormStatusChange" />
				</div>
				<ul v-else class="forms-container">
					<li v-for="(form, index) in forms" :key="form.content.id">
						<Button @click="openForm(form)">
							<div class="title-wrapper">
								<p class="title">{{ form.content.title }}</p>
								<span class="number">/{{ formatIndex(Number(index) + 1) }}</span>
							</div>
							<p class="description" v-html="nl2br(form.content.description)"></p>
						</Button>
					</li>
				</ul>
			</div>
		</div>
		<template #footer>
			<transition mode="out-in" :css="false" @leave="onButtonLeave" @enter="onButtonEnter">
				<Button v-if="!selectedForm || formStatus === 'success'" key="close" @click="closeDrawer">
					<span ref="closeLabelRef">{{ $t('close') }}</span>
				</Button>
				<Button v-else key="back" @click="backToChoices">
					<span>{{ $t('backToChoices') }}</span>
				</Button>
			</transition>
		</template>
	</DrawerMenu>
</template>

<style scoped lang="scss">
@use 'sass:map';

$border: 1px solid rgba($eerieBlack, 0.08);

.text-container {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.forms-container {
	display: flex;
	flex-direction: column;

	li {
		position: relative;
		border-bottom: $border;

		&:last-child {
			border-bottom: none;
		}

		@include hover {
			&::before {
				opacity: 1;
				transform: translate3d(0, 0, 0);
				transition:
					opacity 0.4s $power2Out,
					transform 0.4s $power2Out;
			}
		}

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			opacity: 0;
			background: map.get($gradients, 'menu-khaki');
			transition:
				opacity 0.4s $power2Out,
				transform 0.4s $power2Out 0.3s;
			transform: translate3d(-50%, 0, 0);
			pointer-events: none;
		}

		button {
			position: relative;
			display: flex;
			flex-direction: column;
			gap: 8px;
			width: 100%;
			padding: 20px var(--menu-padding-inline) 16px;
		}

		.title-wrapper {
			display: flex;
			justify-content: space-between;
			gap: var(--menu-padding-inline);

			.title {
				@include roobert-16-uppercase;

				width: 100%;
			}

			.number {
				@include roobert-16-uppercase;

				color: $khaki;
				flex-shrink: 0;
			}
		}

		.description {
			@include roobert-14;

			width: 100%;
			color: $khaki;
		}
	}
}

:deep(.drawer-footer) {
	button {
		display: flex;
		align-items: center;
		width: 100%;
		height: 100%;

		span {
			@include roobert-14-uppercase;
		}
	}
}
</style>
