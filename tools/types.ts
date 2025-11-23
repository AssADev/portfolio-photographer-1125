import type { InterfaceDeclaration, OptionalKind, PropertySignatureStructure, SourceFile, Type } from 'ts-morph';

type FieldCallback = (tsInterface: InterfaceDeclaration) => void;

export type GetFromCacheFunction<T = any> = (key: string, cb: () => Promise<T>) => T | Promise<T>;

export type TypeResolver = {
	interfaces?: string[];
	addFields?: OptionalKind<PropertySignatureStructure>[];
	removeFields?: (string | RegExp)[];
	changeFields?:
		| FieldCallback
		| {
				name: string;
				type?: string | ((originalType: Type, source: SourceFile) => string | undefined);
				hasQuestionToken?: boolean;
		  }[];
};

export const arrayToElementType = (originalType: Type) => {
	const text = originalType.getArrayElementType()?.getText() || '';
	return text.replaceAll(/import\([^)]*\)\./g, '');
};
