<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue';

import { formatIndex } from '#utils/formatIndex.ts';
import { nl2br } from '#utils/nl2br.ts';

import DrawerMenu from '#components/partials/DrawerMenu.vue';
import Form from '#components/partials/Form.vue';

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
const selectedForm = ref<any | null>(null);
const formStatus = ref<'idle' | 'success' | 'error'>('idle');

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
</script>

<template>
	<DrawerMenu
		v-model:toggled="toggled"
		theme="light"
		:has-error="formStatus === 'error'"
		:prevent-click-outside="!!selectedForm && formStatus !== 'success'"
		@close="closeDrawer"
	>
		<template #title>
			<transition v-if="showTransition" name="fade" mode="out-in">
				<div :key="selectedForm ? selectedForm.content.id : 'default'" class="text-container">
					<p class="title">{{ currentTitle }}</p>
					<p v-if="currentDescription" class="description" v-html="nl2br(currentDescription)"></p>
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
					<li v-for="(form, index) in forms" :key="form.content.id">
						<button @click="openForm(form)">
							<div class="title-wrapper">
								<p class="title">{{ form.content.title }}</p>
								<span class="number">/{{ formatIndex(index + 1) }}</span>
							</div>
							<p class="description" v-html="nl2br(form.content.description)"></p>
						</button>
					</li>
				</ul>
			</transition>
			<div v-else>
				<div v-if="selectedForm" class="form-detail">
					<Form :form="selectedForm" :language="language" @status="onFormStatusChange" />
				</div>
				<ul v-else class="forms-container">
					<li v-for="(form, index) in forms" :key="form.content.id">
						<button @click="openForm(form)">
							<div class="title-wrapper">
								<p class="title">{{ form.content.title }}</p>
								<span class="number">/{{ formatIndex(index + 1) }}</span>
							</div>
							<p class="description" v-html="nl2br(form.content.description)"></p>
						</button>
					</li>
				</ul>
			</div>
		</div>
		<template #footer>
			<button v-if="!selectedForm || formStatus === 'success'" @click="closeDrawer">
				<span>{{ $t('close') }}</span>
			</button>
			<button v-else @click="backToChoices">
				<span>{{ $t('backToChoices') }}</span>
			</button>
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
			}

			.number {
				@include roobert-16-uppercase;

				color: $khaki;
			}
		}

		.description {
			@include roobert-14;

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
