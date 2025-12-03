<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

import Field from '#components/partials/Forms/Field.vue';
import type { FieldProps } from '#components/partials/Forms/types.ts';

// Props :
const model = defineModel<string>({ default: '' });

const { noCheck, ...props } = defineProps<FieldProps>();

// Refs :
const isFocused = ref(false);
const inputEl = useTemplateRef('input');

// Methods :
const focus = () => {
	inputEl.value?.focus();
	isFocused.value = true;
};
const blur = () => {
	inputEl.value?.blur();
	isFocused.value = false;
};

const clear = () => ((model.value = ''), focus());

defineExpose({ focus, blur, clear });
</script>

<template>
	<Field v-bind="props" :value="model">
		<template #default="slotProps">
			<div class="datetime-wrapper">
				<input
					v-bind="{ ...$attrs, ...slotProps }"
					ref="input"
					v-model="model"
					:aria-label="slotProps.ariaLabel"
					type="datetime-local"
					:class="{ 'is-active': model || isFocused }"
					@focus="focus"
					@blur="blur"
				/>
				<span v-if="!model && !isFocused" class="placeholder">{{ slotProps.placeholder }}</span>
			</div>
		</template>
	</Field>
</template>

<style scoped lang="scss">
.datetime-wrapper {
	position: relative;
	width: 100%;
}

input {
	position: relative;
	z-index: 1;
	background: transparent;

	// Hide native placeholder text when empty :
	&:not(.is-active) {
		color: transparent;

		&::-webkit-datetime-edit {
			color: transparent;
		}
	}

	// Ensure calendar icon remains visible/clickable :
	&::-webkit-calendar-picker-indicator {
		opacity: 1;
		cursor: pointer;
	}
}

.placeholder {
	@include roobert-14;

	position: absolute;
	top: 50%;
	left: 0;
	transform: translateY(-50%);
	color: $khaki;
	pointer-events: none;
	user-select: none;
	z-index: 0;
	width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
