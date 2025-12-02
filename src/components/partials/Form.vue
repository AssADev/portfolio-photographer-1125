<script setup lang="ts">
import { useForm } from 'vee-validate';
import { computed, ref } from 'vue';

import { getFieldConfig, mapToProps } from '#utils/form.ts';
import { formatIndex } from '#utils/formatIndex.ts';
import { sleep } from '#utils/sleep.ts';

import Button from '#components/utils/Button.vue';

import { useAnimateHeight } from '#composables/useAnimateHeight.ts';
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

// Composables :
const [innerEl, outerEl] = useAnimateHeight();

// Form :
const { meta, errors, defineField, isSubmitting, handleSubmit } = useForm({
	validationSchema: computed(() => {
		const schema: Record<string, string> = {};
		form.content.inputs.forEach((field: any) => {
			const config = getFieldConfig(field);
			console.log(config);

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

const submitError = ref(false);
const submitSuccess = ref(false);
const loading = useDeferredLoading(isSubmitting);

//// Fields :
const fields: Record<string, any> = {};
form.content.inputs.forEach((field: any) => {
	const config = getFieldConfig(field);
	const [model, props] = defineField(field.name, mapToProps(field.label, config.options));
	fields[field.name] = { model, props };
});
console.log(errors.value);

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
	console.log('onSubmit');

	await handleSubmit(async (values) => {
		console.log(values);

		try {
			await sleep(2000);
			submitSuccess.value = true;
		} catch {
			submitError.value = true;
		}
	})();
	// When the form isn't valid focus the first invalid field :
	if (!meta.value.valid) {
		// @ts-expect-error
		innerEl.value?.querySelector(`[name="${Object.keys(errors.value)[0]}"]`)?.focus();
		return;
	}
};
</script>

<template>
	<div ref="outerEl" class="form-container">
		<div ref="innerEl" class="inner-form-container">
			<form @submit.prevent="onSubmit">
				<component
					v-for="(field, index) in form.content.inputs"
					v-bind="fields[field.name].props.value"
					:key="field.name"
					:is="formInputs[field.component]"
					:name="field.name"
					:placeholder="field.placeholder"
					:index="index + 1"
					:autocomplete="getFieldConfig(field).autocomplete"
					v-model="fields[field.name].model.value"
				/>
				<Button type="submit" class="submit-cta">
					<div class="inner-submit-cta">
						<span>{{ form.content.submitLabel }}</span>
						<span class="total-wrapper">
							{{ formatIndex(validFieldsCount) }} /{{ formatIndex(totalFields) }}
						</span>
					</div>
				</Button>
			</form>
		</div>
	</div>
</template>

<style scoped lang="scss">
.form-container {
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
