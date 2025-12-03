<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';

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

// Watchers :
watch(
	() => formId,
	(newId) => {
		if (newId) {
			const found = forms.value.find((f: any) => f.content.id === newId);
			if (found) openForm(found);
		}
	},
	{ immediate: true }
);
</script>

<template>
	<DrawerMenu v-model:toggled="toggled" theme="light">
		<template #title>
			<transition name="fade" mode="out-in">
				<div :key="selectedForm ? selectedForm.content.id : 'default'" class="text-container">
					<p class="title">{{ currentTitle }}</p>
					<p v-if="currentDescription" class="description" v-html="nl2br(currentDescription)"></p>
				</div>
			</transition>
		</template>
		<div class="content-container">
			<transition name="fade" mode="out-in">
				<div v-if="selectedForm" class="form-detail">
					<Form :form="selectedForm" :language="language" @status="onFormStatusChange" />
					<button @click="backToChoices">
						{{ $t('backToChoices') }}
					</button>
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
		</div>
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
	gap: 24px;

	li {
		position: relative;

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
</style>
