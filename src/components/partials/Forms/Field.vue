<script setup lang="ts">
import { computed } from 'vue';

import { formatIndex } from '#utils/formatIndex.ts';

import type { FieldProps } from '#components/partials/Forms/types.ts';

// Props & Model :
defineOptions({ inheritAttrs: false });

const { id, name, label, placeholder, noCheck, index } = defineProps<FieldProps & { value?: string }>();

// Form :
const _id = id || `input-${name}`;
const accessibleLabel = computed(() => label || placeholder || name);
</script>

<template>
	<div
		class="field-container"
		:class="[
			$props.class,
			{
				'field-disabled': disabled,
				'field-invalid': invalid || !!error,
				'field-empty': !placeholder && (value == null || value == '')
			}
		]"
	>
		<div class="field-wrapper">
			<div class="input-wrapper">
				<span class="input-number">/{{ formatIndex(index) }}</span>
				<label v-if="label" class="label" :for="_id">
					{{ label }}
				</label>
				<slot
					v-bind="{
						id: _id,
						ariaLabel: accessibleLabel,
						ariaInvalid: error ? true : null,
						ariaDescribedby: error ? _id + '-error' : null,
						name,
						noCheck,
						placeholder
					}"
				/>
				<p class="error-message" v-if="error" :id="_id + '-error'">
					<span>{{ error }}</span>
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
@use 'sass:map';

.field-container {
	position: relative;
	width: 100%;

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		opacity: 0;
		background: map.get($gradients, 'form-error');
		transition:
			opacity 0.4s $power2Out,
			transform 0.4s $power2Out 0.3s;
		transform: translate3d(-50%, 0, 0);
		pointer-events: none;
	}

	&.field-invalid {
		&::before {
			opacity: 1;
			transform: translate3d(0, 0, 0);
			transition:
				opacity 0.4s $power2Out,
				transform 0.4s $power2Out;
		}

		:deep(input) {
			color: $red;
		}
	}
}

.field-wrapper {
	position: relative;
	display: flex;
	width: 100%;
	padding: var(--menu-padding-inline);
	border-bottom: 1px solid rgba($eerieBlack, 0.08);

	@include focus-within {
		border: 1px solid currentColor;
	}

	&:focus-within {
		:deep(input),
		:deep(textarea) {
			color: currentColor;
		}
	}
}

.input-wrapper {
	position: relative;
	width: 100%;

	:deep(input),
	:deep(textarea) {
		@include roobert-14;

		width: 100%;
		min-height: 24px;
		transition: color 0.4s $power2Out;

		&::placeholder {
			color: $khaki;
		}
	}
}

.input-number {
	@include roobert-16;

	position: absolute;
	top: 0;
	right: 0;
	color: $khaki;
}

.label {
	@include roobert-16;

	display: block;
	max-width: calc(100% - var(--menu-padding-inline) - 20px);

	.field-empty:not(:focus-within) & {
		pointer-events: none;
	}
}

.error-message {
	@include roobert-12;

	color: $red;
	margin-block-start: 8px;
}
</style>
