<script setup lang="ts">
import { ref } from 'vue';

import Field from '#components/partials/Forms/Field.vue';
import type { FieldProps } from '#components/partials/Forms/types.ts';

// Types :
type RadioItem = {
	_uid: string;
	label: string;
	component?: string;
	[key: string]: unknown;
};

// Props :
const model = defineModel<string>({ default: '' });

const { noCheck, items, ...props } = defineProps<FieldProps & { items?: RadioItem[] }>();

// Refs :
const inputEls = ref<HTMLInputElement[]>([]);

// Methods :
const blur = () => {
	const active = inputEls.value.find((el) => el === document.activeElement);
	active?.blur();
};
const focus = () => {
	const checked = inputEls.value.find((el) => el.checked);
	if (checked) checked.focus();
	else inputEls.value[0]?.focus();
};
const clear = () => ((model.value = ''), focus());

defineExpose({ focus, blur, clear });
</script>

<template>
	<Field v-bind="props" :value="model">
		<template #default="{ name, ariaLabel, ariaDescribedby, ariaInvalid }">
			<div class="radio-group" role="radiogroup" :aria-label="ariaLabel">
				<div v-for="item in items" :key="item._uid" class="radio-item">
					<input
						:id="item._uid"
						ref="inputEls"
						v-model="model"
						type="radio"
						:name="name"
						:value="item.label"
						:aria-describedby="ariaDescribedby || undefined"
						:aria-invalid="ariaInvalid || undefined"
					/>
					<label :for="item._uid">{{ item.label }}</label>
				</div>
			</div>
		</template>
	</Field>
</template>

<style scoped lang="scss">
.radio-group {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 12px;
}

.radio-item {
	display: flex;
	gap: 10px;

	input[type='radio'] {
		position: relative;
		width: 10px;
		height: 10px;
		min-height: auto;
		aspect-ratio: 1/1;
		margin-block-start: 3px;
		appearance: none;
		cursor: pointer;
		border: 1px solid $eerieBlack;
		border-radius: 50%;

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: $eerieBlack;
			border-radius: 50%;
			transform: scale3d(0, 0, 1);
			transition: transform 0.4s $power2Out;
		}

		@include hover {
			&::before {
				transform: scale3d(0.4, 0.4, 1);
				transition: transform 0.25s $power2Out;
			}
		}

		&:checked {
			&::before {
				transform: scale3d(1, 1, 1) !important;
			}
		}

		&:focus-visible {
			outline: 1px solid $eerieBlack;
			outline-offset: 2px;
		}
	}

	label {
		@include roobert-14;

		cursor: pointer;
	}
}
</style>
