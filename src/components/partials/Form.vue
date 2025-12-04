<script setup lang="ts">
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import { PUBLIC_HCAPTCHA_SITE_KEY, PUBLIC_WEB3FORMS_ACCESS_KEY } from 'astro:env/client';
import { useForm } from 'vee-validate';
import { computed, ref, useTemplateRef, watch } from 'vue';

import { getFieldConfig, mapToProps } from '#utils/form.ts';
import { formatIndex } from '#utils/formatIndex.ts';
import { sleep } from '#utils/sleep.ts';

import Button from '#components/utils/Button.vue';

import { useDeferredLoading } from '#composables/useDeferredLoading.ts';

// Dynamic imports (Inputs) :
const formInputs = Object.fromEntries(
	Object.entries(import.meta.glob('./Forms/*.vue', { eager: true })).map(([path, mod]: [string, any]) => [
		path.split('/').pop()?.replace('.vue', '') || '',
		mod.default
	])
);

// Props & Model :
const { form, language } = defineProps<{ form: any; language: string }>();

// Refs :
const formEl = useTemplateRef('formEl');

// Form :
const { meta, errors, defineField, isSubmitting, handleSubmit } = useForm({
	validationSchema: computed(() => {
		const schema: Record<string, string> = {};
		form.content.inputs.forEach((field: any) => {
			const config = getFieldConfig(field);
			if (config.validation) schema[field.name] = config.validation;
		});
		return schema;
	}),
	initialValues: form.content.inputs.reduce(
		(acc: Record<string, string>, field: any) => {
			acc[field.name] = field.defaultValue || '';
			return acc;
		},
		{} as Record<string, string>
	)
});

const emit = defineEmits<{
	(e: 'status', value: 'idle' | 'success' | 'error'): void;
}>();

const submitError = ref(true);
const submitSuccess = ref(false);
const loading = useDeferredLoading(isSubmitting);

watch(submitSuccess, (val: boolean) => {
	if (val) emit('status', 'success');
});

watch(submitError, (val: boolean) => {
	if (val) emit('status', 'error');
	else if (!submitSuccess.value) emit('status', 'idle');
});

const formError = form.content.formError[0];
const formErrorSubtitle = computed(() => {
	return formError.subtitle.replace('{%i}', `<span class="identity">${fields['identity'].model.value}</span>`);
});

const formSuccess = form.content.formSuccess[0];
const formSuccessSubtitle = computed(() => {
	return formSuccess.subtitle.replace('{%i}', `<span class="identity">${fields['identity'].model.value}</span>`);
});

//// Fields :
const fields: Record<string, any> = {};
form.content.inputs.forEach((field: any) => {
	const config = getFieldConfig(field);
	const [model, props] = defineField(field.name, mapToProps(field.label, config.options));
	fields[field.name] = { model, props };
});

// Computed :
const totalFields = computed(() => Object.keys(fields).length);
const validFieldsCount = computed(() => {
	return Object.keys(fields).filter((fieldName) => {
		const hasError = errors.value[fieldName];
		const hasValue = fields[fieldName].model.value;
		return !hasError && hasValue;
	}).length;
});

//// Submit :
const onSubmit = async () => {
	await handleSubmit(async (values) => {
		// console.log(values);

		try {
			await sleep(2000);

			// Prepare form data for Web3Forms :
			const web3FormData = new FormData();
			web3FormData.append('access_key', PUBLIC_WEB3FORMS_ACCESS_KEY);
			web3FormData.append('user_language', language.toUpperCase());
			web3FormData.append(
				'subject',
				`[${language.toUpperCase()}] Portfolio photographe : ${form.content.id.charAt(0).toUpperCase() + form.content.id.slice(1)}`
			);

			Object.entries(values).forEach(([key, value]) => {
				web3FormData.append(key, value as string);
			});

			// Submit to Web3Forms :
			const response = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				body: web3FormData
			});

			const data = await response.json();
			console.log(data);

			if (data.success) {
				submitSuccess.value = true;
				submitError.value = false;
			} else {
				throw new Error(data.message || 'Form submission failed');
			}
		} catch (error) {
			console.error('Form submission error:', error);
			submitError.value = true;
			submitSuccess.value = false;
		}
	})();
	// When the form isn't valid focus the first invalid field :
	if (!meta.value.valid) {
		// @ts-expect-error
		formEl.value?.querySelector(`[name="${Object.keys(errors.value)[0]}"]`)?.focus();
		return;
	}
};
</script>

<template>
	<div class="form-container">
		<div class="inner-form-container">
			<div v-if="submitSuccess" class="form-message success">
				<p class="title" v-html="formSuccessSubtitle"></p>
				<p class="description">{{ formSuccess.description }}</p>
			</div>
			<div v-else-if="submitError" class="form-message error">
				<p class="title" v-html="formErrorSubtitle"></p>
				<p class="description">{{ formError.description }}</p>
				<Button @click="submitError = false" theme="dot-khaki" :text="$t('tryAgain')" />
			</div>
			<form ref="formEl" v-else @submit.prevent="onSubmit">
				<div class="form-content-container">
					<component
						v-for="(field, index) in form.content.inputs"
						v-bind="fields[field.name].props.value"
						:key="field.name"
						:is="formInputs[field.component]"
						:name="field.name"
						:placeholder="field.placeholder"
						:index="index + 1"
						:autocomplete="getFieldConfig(field).autocomplete"
						:items="field.items"
						v-model="fields[field.name].model.value"
					/>
				</div>

				<Button type="submit" class="submit-cta">
					<div class="inner-submit-cta">
						<span>{{ form.content.submitLabel }}</span>
						<span class="total-wrapper">
							{{ formatIndex(validFieldsCount) }} /{{ formatIndex(totalFields) }}
						</span>
					</div>
				</Button>

				<VueHcaptcha :sitekey="PUBLIC_HCAPTCHA_SITE_KEY" size="invisible" />
			</form>
		</div>
	</div>
</template>

<style scoped lang="scss">
.form-message {
	padding: 16px var(--menu-padding-inline);

	.title {
		@include roobert-20;

		:deep(span) {
			@include romie-20-italic;
		}
	}

	.description {
		@include roobert-14;

		color: $khaki;
		margin-block-start: 8px;
	}

	.partials-button {
		margin-block-start: 22px;
	}
}

.form-content-container {
	@include hide-scrollbar;

	max-height: calc(100vh - 100px - 50px - 150px - var(--header-height));
	overflow-y: auto;
}

.submit-cta {
	@include roobert-16-uppercase;

	position: relative;
	width: 100%;

	@include hover {
		&::before {
			opacity: 1;
		}
	}

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		opacity: 0.5;
		background: linear-gradient(180deg, rgba($khaki, 0.2) 0%, rgba($khaki, 0) 100%);
		transition: opacity 0.4s $power2Out;
	}

	.inner-submit-cta {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--menu-padding-inline);
		width: 100%;
		padding: 16px var(--menu-padding-inline);
	}

	.total-wrapper {
		@include roobert-16;

		color: $khaki;
	}
}
</style>
