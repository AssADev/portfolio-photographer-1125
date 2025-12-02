<script setup lang="ts">
import { useTemplateRef } from 'vue';

import Field from '#components/partials/Forms/Field.vue';
import type { FieldProps } from '#components/partials/Forms/types.ts';

// Props :
const model = defineModel<string>({ default: '' });

const { noCheck, ...props } = defineProps<FieldProps>();

// Refs :
const inputEl = useTemplateRef('input');

// Methods :
const blur = () => inputEl.value?.blur();
const focus = () => inputEl.value?.focus();
const clear = () => ((model.value = ''), focus());

defineExpose({ focus, blur, clear });
</script>

<template>
	<Field v-bind="props" :value="model">
		<template #default="slotProps">
			<input
				v-bind="{ ...$attrs, ...slotProps }"
				ref="input"
				v-model="model"
				:aria-label="slotProps.ariaLabel"
				type="text"
			/>
		</template>
	</Field>
</template>
