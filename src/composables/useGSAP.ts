import gsap from 'gsap';
import { type Reactive, type Ref, isRef, onMounted, onUnmounted, reactive, ref, unref } from 'vue';

import type { RefOrComponentRef } from '#types/utils.ts';

type ScopeType = RefOrComponentRef | Element | string;
type CallbackType = (ctx: gsap.Context) => void;
type ReturnType = Reactive<{
	context: Ref<gsap.Context | undefined>;
	add: <T extends (...args: any[]) => any>(func: T) => undefined | gsap.ContextFunc;
}>;

export function useGSAP(scope: ScopeType): ReturnType;
export function useGSAP(callback: CallbackType, scope: ScopeType): ReturnType;
export function useGSAP(scopeOrCallback: ScopeType | CallbackType, scope?: ScopeType) {
	const context: Ref<gsap.Context | undefined> = ref();

	const actualScope: ScopeType = typeof scopeOrCallback === 'function' ? scope! : scopeOrCallback;
	const actualCallback: CallbackType = typeof scopeOrCallback === 'function' ? scopeOrCallback : () => {};

	onMounted(() => {
		// Create a new context :
		const _unrefScoped = isRef(actualScope) ? unref(actualScope) : actualScope;

		// Get node or component node :
		const _scope =
			typeof _unrefScoped === 'string' || _unrefScoped instanceof HTMLElement
				? _unrefScoped
				: (_unrefScoped as any).$el;

		context.value = gsap.context(actualCallback, _scope);
	});

	onUnmounted(() => {
		context.value?.kill();
	});

	const add = <T extends (...args: any[]) => any>(func: T) => context.value?.add(func);

	return reactive({ context, add });
}
