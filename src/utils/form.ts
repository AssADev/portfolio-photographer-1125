import { defineRule } from 'vee-validate';

import { t } from '#utils/i18n.ts';

type ValidatorFn = Parameters<typeof defineRule>[1];

// Validators :
export const is =
	<T>(correct: T): ValidatorFn =>
	(val: any) =>
		val === correct;

export const required: ValidatorFn = (val: unknown, _p, ctx) =>
	(val != null && val !== '') || t('formRuleRequired', { field: ctx.label || ctx.name });

export const email: ValidatorFn = (val: unknown, p, ctx) => {
	const r = required(val, p, ctx);
	if (r !== true) return r;
	return (
		(typeof val === 'string' &&
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
				val.toLowerCase()
			)) ||
		t('formRuleEmail', { field: ctx.label || ctx.name })
	);
};

// Rules :
defineRule('required', required);
defineRule('email', email);

// Map to props :
export const mapToProps = (label: string | undefined = undefined, { error = true, required = false } = {}) => ({
	props: (state: { errors: string[] }) => {
		const o: Record<string, any> = { label };
		if (error) o.error = state.errors.join(', ');
		if (required) {
			o.ariaRequired = true;
			o.required = true;
		}
		return o;
	},
	label
});
