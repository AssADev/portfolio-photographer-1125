import { defineRule } from 'vee-validate';

import { t } from '#utils/i18n.ts';

type ValidatorFn = Parameters<typeof defineRule>[1];

// Validators :
export const is =
	<T>(correct: T): ValidatorFn =>
	(val: any) =>
		val === correct;

export const required: ValidatorFn = (val: unknown, _p, ctx) => (val != null && val !== '') || t('formRuleRequired');

export const email: ValidatorFn = (val: unknown, p, ctx) => {
	const r = required(val, p, ctx);
	if (r !== true) return r;
	return (
		(typeof val === 'string' &&
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
				val.toLowerCase()
			)) ||
		t('formRuleEmail')
	);
};

export const minDate: ValidatorFn = (val: unknown) => {
	if (!val) return true;
	const date = new Date(val as string);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// Check if it's a valid date :
	if (isNaN(date.getTime())) return true;

	if (date < today) return t('formRuleMinDate');
	return true;
};

// Rules :
defineRule('required', required);
defineRule('email', email);
defineRule('minDate', minDate);

// Map to props :
export const mapToProps = (
	label: string | undefined = undefined,
	{ error = true, required = false, min = undefined }: any = {}
) => ({
	props: (state: { errors: string[] }) => {
		const o: Record<string, any> = { label };
		if (error) o.error = state.errors.join(', ');
		if (required) {
			o.ariaRequired = true;
			o.required = true;
		}
		if (min) o.min = min;
		return o;
	},
	label
});

// Fields Configuration :
const defaultFieldConfig: Record<string, { validation?: string; options?: any; autocomplete?: string }> = {
	identity: { validation: 'required', options: { required: true }, autocomplete: 'name' },
	email: { validation: 'email', options: { required: true }, autocomplete: 'email' },
	location: { validation: 'required', options: { required: true }, autocomplete: 'home address-level2' },
	message: { validation: 'required', options: { required: true }, autocomplete: 'off' },
	services: { validation: 'required', options: { required: true }, autocomplete: 'off' },
	date: {
		validation: 'required|minDate',
		options: {
			required: true,
			min: (() => {
				const d = new Date();
				return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
			})()
		},
		autocomplete: 'off'
	},
	datetime: {
		validation: 'required|minDate',
		options: {
			required: true,
			min: (() => {
				const d = new Date();
				return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
			})()
		},
		autocomplete: 'off'
	}
};

export const getFieldConfig = (field: any) => {
	const defaultConfig = defaultFieldConfig[field.name] || {};
	return {
		validation: field.validation || defaultConfig.validation,
		options: { ...defaultConfig.options, ...field.options },
		autocomplete: field.autocomplete || defaultConfig.autocomplete
	};
};
