// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Generates the API reference of the @oito2 packages as JSON for the showcase:
// apps/showcase/src/lib/api/api.json.
//
// For each package it reads the public exports of src/lib/index.ts. Svelte components
// (`export { default as Name } from './Name.svelte'`) and compound components
// (`export * as Name from './name/index.js'`, whose parts are components) go through
// svelte2tsx; the TypeScript compiler API then reads their `@component` comment, their
// `Props` members with types, TSDoc, defaults and `$bindable`, and the attributes `Props`
// extends. Other exports keep their kind and TSDoc summary. With --check nothing is
// written, and the script exits with status 1 when the file on disk differs.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte2tsx } from 'svelte2tsx';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = join(root, 'apps/showcase/src/lib/api/api.json');

/** The packages documented, by name and folder. */
const packages: [string, string][] = [
	['@oito2/ui', 'packages/ui'],
	['@oito2/ui-syntax', 'packages/ui-syntax'],
	['@oito2/ui-extras', 'packages/ui-extras'],
	['@oito2/ui-files', 'packages/ui-files'],
	['@oito2/ui-window', 'packages/ui-window'],
	['@oito2/ui-settings', 'packages/ui-settings'],
	['@oito2/ui-themes', 'packages/ui-themes']
];

/** What a prop is for: content to render, a callback, or a plain value. */
type PropKind = 'prop' | 'event' | 'snippet';

/** A prop of a component. */
interface ApiProp {
	name: string;
	kind: PropKind;
	type: string;
	optional: boolean;
	default?: string;
	bindable?: boolean;
	doc: string;
}

/** A Svelte component, or a part of a compound one. */
interface ApiComponent {
	kind: 'component';
	source: string;
	doc: string;
	extends?: string;
	props: ApiProp[];
}

/** A compound component: a namespace of parts. */
interface ApiCompound {
	kind: 'compound';
	parts: Record<string, ApiComponent>;
}

/** Any other export: a function, class, constant or type. */
interface ApiOther {
	kind: 'function' | 'class' | 'constant' | 'type' | 'interface';
	source: string;
	doc: string;
}

type ApiEntry = ApiComponent | ApiCompound | ApiOther;

/** Returns the text of the JSDoc comments right before `node`, without the markers and tags. */
function docOf(node: ts.Node, source: ts.SourceFile): string {
	const ranges = ts.getLeadingCommentRanges(source.text, node.getFullStart()) ?? [];
	const block = ranges
		.map((range) => source.text.slice(range.pos, range.end))
		.filter((text) => text.startsWith('/**'))
		.at(-1);
	if (!block) return '';
	return block
		.replace(/^\/\*\*\s?/, '')
		.replace(/\s*\*\/$/, '')
		.split('\n')
		.map((line) => line.replace(/^\s*\* ?/, ''))
		.join('\n')
		.replace(/\\`/g, '`')
		.trim();
}

/** Returns the text of `node` with whitespace runs collapsed. */
function textOf(node: ts.Node, source: ts.SourceFile): string {
	return node
		.getText(source)
		.replace(/\s+/g, ' ')
		.replace(/<\s+/g, '<')
		.replace(/\s+>/g, '>')
		.trim();
}

/** Returns what a prop is for, from its name and type. */
function kindOf(name: string, type: string): PropKind {
	if (/\bSnippet\b/.test(type)) return 'snippet';
	if (/^on[A-Z]/.test(name) && /=>/.test(type)) return 'event';
	return 'prop';
}

/** Reads the component in the Svelte file `file`. */
function readComponent(file: string): ApiComponent {
	const svelte = readFileSync(file, 'utf8');
	const name =
		file
			.split('/')
			.at(-1)
			?.replace(/\.svelte$/, '') ?? 'Component';
	const { code } = svelte2tsx(svelte, { filename: file, isTsFile: true, mode: 'ts' });
	const source = ts.createSourceFile(
		`${name}.tsx`,
		code,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX
	);
	let doc = '';
	let extendsText: string | undefined;
	const members = new Map<string, ApiProp>();
	const defaults = new Map<string, { default?: string; bindable: boolean }>();

	const readMembers = (list: ts.NodeArray<ts.TypeElement>) => {
		for (const member of list) {
			if (!ts.isPropertySignature(member) || !member.name) continue;
			const propName = member.name.getText(source).replace(/^['"]|['"]$/g, '');
			const type = member.type ? textOf(member.type, source) : 'unknown';
			members.set(propName, {
				name: propName,
				kind: kindOf(propName, type),
				type,
				optional: member.questionToken !== undefined,
				doc: docOf(member, source)
			});
		}
	};

	const visit = (node: ts.Node) => {
		if (ts.isInterfaceDeclaration(node) && node.name.text === 'Props') {
			readMembers(node.members);
			const heritage = node.heritageClauses?.flatMap((clause) =>
				clause.types.map((type) => textOf(type, source))
			);
			if (heritage?.length) extendsText = heritage.join(', ');
		}
		if (
			ts.isTypeAliasDeclaration(node) &&
			(node.name.text === 'Props' || node.name.text === '$$ComponentProps')
		) {
			const types = ts.isIntersectionTypeNode(node.type) ? node.type.types : [node.type];
			for (const part of types) {
				if (ts.isTypeLiteralNode(part)) readMembers(part.members);
				else
					extendsText = extendsText
						? `${extendsText}, ${textOf(part, source)}`
						: textOf(part, source);
			}
		}
		if (
			ts.isVariableDeclaration(node) &&
			ts.isObjectBindingPattern(node.name) &&
			node.initializer &&
			/\$props\(\)/.test(node.initializer.getText(source))
		) {
			if (node.type && ts.isTypeLiteralNode(node.type)) readMembers(node.type.members);
			if (node.type && ts.isIntersectionTypeNode(node.type)) {
				for (const part of node.type.types) {
					if (ts.isTypeLiteralNode(part)) readMembers(part.members);
					else
						extendsText = extendsText
							? `${extendsText}, ${textOf(part, source)}`
							: textOf(part, source);
				}
			}
			for (const element of node.name.elements) {
				const key = (element.propertyName ?? element.name).getText(source);
				if (element.dotDotDotToken) continue;
				const initializer = element.initializer;
				if (!initializer) {
					defaults.set(key, { bindable: false });
					continue;
				}
				const text = textOf(initializer, source);
				const bindable = /^\$bindable\(/.test(text);
				const inner = bindable
					? text.replace(/^\$bindable\(([\s\S]*)\)$/, '$1').trim()
					: text;
				defaults.set(key, { bindable, ...(inner ? { default: inner } : {}) });
			}
		}
		if (ts.isVariableStatement(node) && /__SvelteComponent_/.test(node.getText(source))) {
			const found = docOf(node, source);
			if (found) doc = found;
		}
		ts.forEachChild(node, visit);
	};
	visit(source);

	const props = [...members.values()].map((prop) => {
		const found = defaults.get(prop.name);
		return {
			...prop,
			...(found?.default !== undefined ? { default: found.default } : {}),
			...(found?.bindable ? { bindable: true } : {})
		};
	});
	return {
		kind: 'component',
		source: relative(root, file),
		doc: doc.replace(/^@component\s*/, ''),
		...(extendsText ? { extends: extendsText } : {}),
		props
	};
}

/** Returns the absolute path of the module `specifier` imported from `from`, `.js` read as `.ts`. */
function resolveModule(from: string, specifier: string): string {
	const base = join(dirname(from), specifier);
	if (base.endsWith('.svelte')) return base;
	const candidates = [base.replace(/\.js$/, '.ts'), base, `${base}.ts`, join(base, 'index.ts')];
	return candidates.find((candidate) => existsSync(candidate)) ?? base;
}

/** Returns the kind and TSDoc of the export `name` declared in the module `file`. */
function readOther(file: string, name: string): ApiOther {
	const text = readFileSync(file, 'utf8');
	const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
	let entry: ApiOther = { kind: 'constant', source: relative(root, file), doc: '' };
	const visit = (node: ts.Node) => {
		const named = (declared: ts.Identifier | undefined) => declared?.text === name;
		if (ts.isFunctionDeclaration(node) && named(node.name))
			entry = { kind: 'function', source: entry.source, doc: docOf(node, source) };
		else if (ts.isClassDeclaration(node) && named(node.name))
			entry = { kind: 'class', source: entry.source, doc: docOf(node, source) };
		else if (ts.isInterfaceDeclaration(node) && named(node.name))
			entry = { kind: 'interface', source: entry.source, doc: docOf(node, source) };
		else if (ts.isTypeAliasDeclaration(node) && named(node.name))
			entry = { kind: 'type', source: entry.source, doc: docOf(node, source) };
		else if (ts.isVariableStatement(node)) {
			for (const declaration of node.declarationList.declarations) {
				if (ts.isIdentifier(declaration.name) && declaration.name.text === name)
					entry = { kind: 'constant', source: entry.source, doc: docOf(node, source) };
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(source);
	return entry;
}

/** Reads the public exports of the package index `index`. */
function readPackage(index: string): Record<string, ApiEntry> {
	const text = readFileSync(index, 'utf8');
	const source = ts.createSourceFile(index, text, ts.ScriptTarget.Latest, true);
	const entries: Record<string, ApiEntry> = {};
	for (const statement of source.statements) {
		if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) continue;
		const specifier = (statement.moduleSpecifier as ts.StringLiteral).text;
		if (!specifier.startsWith('.')) continue;
		const target = resolveModule(index, specifier);
		const clause = statement.exportClause;
		if (clause && ts.isNamespaceExport(clause)) {
			const parts = readPackage(target);
			const components = Object.fromEntries(
				Object.entries(parts).filter(
					(entry): entry is [string, ApiComponent] => entry[1].kind === 'component'
				)
			);
			if (Object.keys(components).length > 0)
				entries[clause.name.text] = { kind: 'compound', parts: components };
			continue;
		}
		if (!clause || !ts.isNamedExports(clause)) continue;
		for (const element of clause.elements) {
			const exported = element.name.text;
			const local = (element.propertyName ?? element.name).text;
			if (entries[exported]) continue;
			if (target.endsWith('.svelte') && local === 'default')
				entries[exported] = readComponent(target);
			else if (existsSync(target)) entries[exported] = readOther(target, local);
		}
	}
	return entries;
}

const api: Record<string, Record<string, ApiEntry>> = {};
for (const [name, folder] of packages) {
	const index = join(root, folder, 'src/lib/index.ts');
	if (existsSync(index)) api[name] = readPackage(index);
}
const json = `${JSON.stringify({ packages: api }, null, '\t')}\n`;

if (process.argv.includes('--check')) {
	const current = existsSync(output) ? readFileSync(output, 'utf8') : '';
	if (current !== json) {
		console.error(`${relative(root, output)} is out of date; run pnpm docs.`);
		process.exit(1);
	}
	console.log('The API reference is up to date.');
} else {
	writeFileSync(output, json);
	console.log(`Wrote ${relative(root, output)}.`);
}
