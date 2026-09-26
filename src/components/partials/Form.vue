<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { PUBLIC_WEB3FORMS_ACCESS_KEY } from 'astro:env/client';
import gsap from 'gsap';
import { useForm } from 'vee-validate';
import { computed, ref, useTemplateRef, watch } from 'vue';

import { animations } from '#utils/Animations.ts';
import { escapeHtml } from '#utils/escapeHtml.ts';
import { getFieldConfig, mapToProps } from '#utils/form.ts';
import { formatDateForSubmission } from '#utils/formatDate.ts';
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
const submitCtaRef = useTemplateRef('submitCtaRef');
const formContentContainerRef = useTemplateRef('formContentContainerRef');

// Variables :
const MIN_SUBMIT_DURATION = 2000;

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

const isAnimating = ref(false);
const submitError = ref(false);
const submitSuccess = ref(false);
const loading = useDeferredLoading(isSubmitting);

// Anti-spam :
const botcheck = ref(false);

//// Fields :
const fields: Record<string, any> = {};
form.content.inputs.forEach((field: any) => {
	const config = getFieldConfig(field);
	const [model, props] = defineField(field.name, mapToProps(field.label, config.options));
	fields[field.name] = { model, props };
});

//// Computed :
// The identity is typed by the user, so it must be escaped before being injected in the HTML :
const identityHtml = computed(() => `<span class="identity">${escapeHtml(fields['identity']?.model.value)}</span>`);

const formError = form.content.formError[0];
const formErrorSubtitle = computed(() => formError.subtitle.replace('{%i}', identityHtml.value));

const formSuccess = form.content.formSuccess[0];
const formSuccessSubtitle = computed(() => formSuccess.subtitle.replace('{%i}', identityHtml.value));

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
		// Honeypot : only bots can check this hidden field, so we fake a success without sending anything :
		if (botcheck.value) {
			await sleep(MIN_SUBMIT_DURATION);
			submitSuccess.value = true;
			return;
		}

		try {
			// Prepare form data for Web3Forms :
			const web3FormData = new FormData();
			web3FormData.append('access_key', PUBLIC_WEB3FORMS_ACCESS_KEY);
			web3FormData.append('user_language', language.toUpperCase());
			web3FormData.append(
				'subject',
				`[${language.toUpperCase()}] Portfolio photographe : ${form.content.id.charAt(0).toUpperCase() + form.content.id.slice(1)}`
			);

			// Format form values :
			Object.entries(values).forEach(([key, value]) => {
				const field = form.content.inputs.find((f: any) => f.name === key);
				let formattedValue = value as string;

				// Format date & datetime fields :
				if (field?.component === 'InputDate' || field?.component === 'InputDatetime') {
					formattedValue = formatDateForSubmission(value as string, field?.component === 'InputDatetime');
				}

				web3FormData.append(key, formattedValue);
			});

			// Submit to Web3Forms :
			const [response] = await Promise.all([
				fetch('https://api.web3forms.com/submit', {
					method: 'POST',
					body: web3FormData
				}),
				sleep(MIN_SUBMIT_DURATION)
			]);

			const data = await response.json();

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

// Resize observers :
useResizeObserver(submitCtaRef, () => {
	const submitCtaHeight = submitCtaRef.value?.$el?.offsetHeight || 0;
	formContentContainerRef.value?.style.setProperty('--submit-cta-height', `${submitCtaHeight}px`);
});

// Watchers :
watch(submitSuccess, (val: boolean) => {
	if (val) emit('status', 'success');
});

watch(submitError, (val: boolean) => {
	if (val) emit('status', 'error');
	else if (!submitSuccess.value) emit('status', 'idle');
});

// Animations :
const onActionLeave = (el: any, done: () => void) => {
	isAnimating.value = true;

	const label = el.querySelector('span');
	if (label) {
		const anim = animations['hide-letters-speed'](label, { onComplete: done });
		gsap.delayedCall(Math.max(0, anim.totalDuration() - 0.25), done);
	} else {
		done();
	}
};

const onActionEnter = (el: any, done: () => void) => {
	const label = el.querySelector('span');
	if (label) {
		const anim = animations['reveal-letters-speed'](label, {
			onComplete: () => {
				isAnimating.value = false;
				done();
			}
		});
		gsap.delayedCall(Math.max(0, anim.totalDuration() - 0.25), () => {
			isAnimating.value = false;
			done();
		});
	} else {
		isAnimating.value = false;
		done();
	}
};
</script>

<template>
	<div class="form-container">
		<div class="inner-form-container">
			<transition name="fade" mode="out-in">
				<div v-if="submitSuccess" key="success" class="form-message success">
					<p class="title" v-html="formSuccessSubtitle"></p>
					<p class="description">{{ formSuccess.description }}</p>
				</div>
				<div v-else-if="submitError" key="error" class="form-message error">
					<p class="title" v-html="formErrorSubtitle"></p>
					<p class="description">{{ formError.description }}</p>
					<Button theme="dot-khaki" :text="$t('tryAgain')" @click="submitError = false" />
				</div>
				<form v-else ref="formEl" key="form" @submit.prevent="onSubmit">
					<div ref="formContentContainerRef" class="form-content-container">
						<component
							v-bind="fields[field.name].props.value"
							:is="formInputs[field.component]"
							v-for="(field, index) in form.content.inputs"
							:key="field.name"
							v-model="fields[field.name].model.value"
							:name="field.name"
							:placeholder="field.placeholder"
							:index="Number(index) + 1"
							:autocomplete="getFieldConfig(field).autocomplete"
							:items="field.items"
						/>
					</div>

					<Button ref="submitCtaRef" type="submit" class="submit-cta" :disabled="loading || isAnimating">
						<div class="inner-submit-cta">
							<transition mode="out-in" :css="false" @leave="onActionLeave" @enter="onActionEnter">
								<div :key="loading ? 'sending' : 'submit'" class="label-submit">
									<span>{{ loading ? $t('contactIsSending') : form.content.submitLabel }}</span>
								</div>
							</transition>
							<span class="total-wrapper">
								{{ formatIndex(validFieldsCount) }} /{{ formatIndex(totalFields) }}
							</span>
						</div>
					</Button>

					<!-- Honeypot (anti-spam), hidden from humans : -->
					<input
						v-model="botcheck"
						type="checkbox"
						name="botcheck"
						class="botcheck"
						tabindex="-1"
						autocomplete="off"
						aria-hidden="true"
					/>
				</form>
			</transition>
		</div>
	</div>
</template>

<style scoped lang="scss">
.botcheck {
	display: none;
}

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

	max-height: calc(
		100svh - var(--drawer-socials-height) - var(--drawer-title-height) - var(--submit-cta-height) - var(
				--header-height
			) -
			(var(--gutter) * 2)
	);
	overflow-y: auto;
	border-top: 1px solid rgba($eerieBlack, 0.08);

	:deep(.field-container:last-child .field-wrapper) {
		border-bottom: none;
	}
}

.submit-cta {
	@include roobert-16-uppercase;

	position: relative;
	width: 100%;
	border-top: 1px solid rgba($eerieBlack, 0.08);

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

		.label-submit {
			display: flex;
			white-space: nowrap;
		}
	}

	.total-wrapper {
		@include roobert-16;

		color: $khaki;
	}
}
</style>
