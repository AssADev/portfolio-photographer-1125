import arg from 'arg';
import { IndentationText, InterfaceDeclaration, Project, QuoteKind, SyntaxKind } from 'ts-morph';

import { componentResolvers } from './componentResolvers.ts';
import { fieldResolvers } from './fieldResolvers.ts';
import type { TypeResolver } from './types.ts';

const args = arg({ '--space': String });

const project = new Project({
	manipulationSettings: { indentationText: IndentationText.Tab, quoteKind: QuoteKind.Single }
});

// Component types :
const componentSrc = project.addSourceFileAtPath(`./.storyblok/types/${args['--space']}/storyblok-components.d.ts`);
// Storyblok generic types :
const sbSrc = project.addSourceFileAtPath(`./.storyblok/types/storyblok.d.ts`);

const outFile = componentSrc.copy('./src/types/component-types-sb.d.ts', { overwrite: true });

// Extract types and interfaces from generic storyblok and copies them over :
const typeDeclarations = sbSrc
	.getStatements()
	.filter(
		(decl) =>
			decl.getKind() === SyntaxKind.InterfaceDeclaration || decl.getKind() === SyntaxKind.TypeAliasDeclaration
	);

outFile.addStatements(typeDeclarations.map((decl) => decl.getFullText()));

// Remove import declaration from .storyblok/types/storyblok :
outFile.getImportDeclarations().forEach((importDecl) => {
	if (importDecl.getText().includes('.storyblok/types/storyblok')) {
		importDecl.remove();
	}
});

outFile.addImportDeclaration({
	namedImports: ['Product', 'Event'],
	isTypeOnly: true,
	moduleSpecifier: '#types/externals.ts'
});

const componentTypeResolvers = Object.values(componentResolvers).filter((resolver) => resolver.resolveTypes);
const fieldTypeResolvers = Object.values(fieldResolvers).filter((resolver) => resolver.resolveTypes);

const parseInterface = (tsInterface: InterfaceDeclaration, resolveTypes: TypeResolver) => {
	if (tsInterface) {
		if (resolveTypes.interfaces) {
			if (!resolveTypes.interfaces.includes(tsInterface.getName())) return;
		}
		if (resolveTypes.addFields) {
			tsInterface.insertProperties(0, resolveTypes.addFields);
		}
		if (resolveTypes.removeFields) {
			const removeFields = resolveTypes.removeFields;
			tsInterface.getProperties().forEach((property) => {
				const propertyName = property.getName();
				if (removeFields.some((f) => (typeof f === 'string' ? f === propertyName : f.test(propertyName)))) {
					property.remove();
				}
			});
		}
		if (resolveTypes.changeFields) {
			if (typeof resolveTypes.changeFields === 'function') resolveTypes.changeFields(tsInterface);
			else
				resolveTypes.changeFields.forEach((field) => {
					const tsField = tsInterface.getProperty(field.name);
					if (tsField) {
						if (field.hasQuestionToken != null) {
							tsField.setHasQuestionToken(field.hasQuestionToken);
						}
						if (field.type) {
							if (typeof field.type === 'function') {
								const newType = field.type(tsField.getType(), outFile);
								if (newType) tsField.setType(newType);
							} else {
								tsField.setType(field.type);
							}
						}
					}
				});
		}
	}
};

for (const { components, resolveTypes } of componentTypeResolvers) {
	const componentTypes = components.map((component) => 'Storyblok' + component);
	componentTypes.forEach((componentType) => {
		const tsInterface = outFile.getInterface(componentType);
		if (tsInterface) parseInterface(tsInterface, resolveTypes!);
	});
}

outFile.getInterfaces().forEach((tsInterface) => {
	fieldTypeResolvers.forEach(({ resolveTypes }) => parseInterface(tsInterface, resolveTypes!));
});

await project.save();
process.exit();
