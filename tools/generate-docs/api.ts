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

// Reads the public API of a package from its index module.
//
// Svelte components (`export { default as Name } from './Name.svelte'`) and compound
// components (`export * as Name from './name/index.js'`, whose parts are components) go
// through svelte2tsx; the TypeScript compiler API then reads their `@component` comment,
// their `Props` members with types, TSDoc, defaults and `$bindable`, and the attributes
// `Props` extends. Other exports keep their kind and TSDoc summary, followed through
// `export { X } from` and `export * from` declarations until their declaration is found.
// `export * from` in an index merges the exports of the target module.

import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { svelte2tsx } from 'svelte2tsx';
import ts from 'typescript';

/** What a prop is for: content to render, a callback, or a plain value. */
export type PropKind = 'prop' | 'event' | 'snippet';

/** A prop of a component. */
export interface ApiProp {
	name: string;
	kind: PropKind;
	type: string;
	optional: boolean;
	default?: string;
	bindable?: boolean;
	doc: string;
}

/** A Svelte component, or a part of a compound one. */
export interface ApiComponent {
	kind: 'component';
	source: string;
	doc: string;
	extends?: string;
	props: ApiProp[];
}

/** A compound component: a namespace of parts. */
export interface ApiCompound {
	kind: 'compound';
	parts: Record<string, ApiComponent>;
}

/** Any other export: a function, class, constant or type. */
export interface ApiOther {
	kind: 'function' | 'class' | 'constant' | 'type' | 'interface';
	source: string;
	doc: string;
}

export type ApiEntry = ApiComponent | ApiCompound | ApiOther;

/** Returns `path` relative to `root`, with `/` as separator on every OS. */
export function posixRelative(root: string, path: string): string {
	return relative(root, path).split(sep).join('/');
}

/** Returns the text of the JSDoc comments right before `node`, without the markers and tags. */
export function docOf(node: ts.Node, source: ts.SourceFile): string {
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
export function textOf(node: ts.Node, source: ts.SourceFile): string {
	return node
		.getText(source)
		.replace(/\s+/g, ' ')
		.replace(/<\s+/g, '<')
		.replace(/\s+>/g, '>')
		.trim();
}

/** Returns what a prop is for, from its name and type. */
export function kindOf(name: string, type: string): PropKind {
	if (/\bSnippet\b/.test(type)) return 'snippet';
	if (/^on[A-Z]/.test(name) && /=>/.test(type)) return 'event';
	return 'prop';
}

/** Reads the component in the Svelte file `file`; `source` is relative to `root`. */
export function readComponent(file: string, root: string): ApiComponent {
	const svelte = readFileSync(file, 'utf8');
	const name = basename(file, '.svelte');
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
		source: posixRelative(root, file),
		doc: doc.replace(/^@component\s*/, ''),
		...(extendsText ? { extends: extendsText } : {}),
		props
	};
}

/** Returns the absolute path of the module `specifier` imported from `from`, `.js` read as `.ts`. */
export function resolveModule(from: string, specifier: string): string {
	const base = join(dirname(from), specifier);
	if (base.endsWith('.svelte')) return base;
	const candidates = [base.replace(/\.js$/, '.ts'), base, `${base}.ts`, join(base, 'index.ts')];
	return candidates.find((candidate) => existsSync(candidate)) ?? base;
}

/** Parses the module `file`; the module script of a Svelte component is read from its svelte2tsx code. */
function parseModule(file: string): ts.SourceFile {
	const raw = readFileSync(file, 'utf8');
	const text = file.endsWith('.svelte')
		? svelte2tsx(raw, { filename: file, isTsFile: true, mode: 'ts' }).code
		: raw;
	return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
}

/** Returns the relative-path re-export declarations of `source`, with their resolved module. */
function reexportsOf(source: ts.SourceFile, file: string): [ts.ExportDeclaration, string][] {
	const found: [ts.ExportDeclaration, string][] = [];
	for (const statement of source.statements) {
		if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) continue;
		const specifier = (statement.moduleSpecifier as ts.StringLiteral).text;
		if (!specifier.startsWith('.')) continue;
		found.push([statement, resolveModule(file, specifier)]);
	}
	return found;
}

/**
 * Returns the kind and TSDoc of the export `name` of the module `file`: declared in it, or
 * reached through its `export { X } from`, `export { Y as X } from` and `export * from`
 * declarations. Returns undefined when no declaration is found; `seen` holds the
 * module-and-name pairs already visited, so cyclic re-exports end.
 */
function findOther(
	file: string,
	name: string,
	root: string,
	seen: Set<string>
): ApiOther | undefined {
	const key = `${file}\0${name}`;
	if (seen.has(key) || !existsSync(file)) return undefined;
	seen.add(key);
	const source = parseModule(file);
	const relativeSource = posixRelative(root, file);
	let entry: ApiOther | undefined;
	const visit = (node: ts.Node) => {
		const named = (declared: ts.Identifier | undefined) => declared?.text === name;
		if (ts.isFunctionDeclaration(node) && named(node.name))
			entry = { kind: 'function', source: relativeSource, doc: docOf(node, source) };
		else if (ts.isClassDeclaration(node) && named(node.name))
			entry = { kind: 'class', source: relativeSource, doc: docOf(node, source) };
		else if (ts.isInterfaceDeclaration(node) && named(node.name))
			entry = { kind: 'interface', source: relativeSource, doc: docOf(node, source) };
		else if (ts.isTypeAliasDeclaration(node) && named(node.name))
			entry = { kind: 'type', source: relativeSource, doc: docOf(node, source) };
		else if (ts.isVariableStatement(node)) {
			for (const declaration of node.declarationList.declarations) {
				if (ts.isIdentifier(declaration.name) && declaration.name.text === name)
					entry = { kind: 'constant', source: relativeSource, doc: docOf(node, source) };
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(source);
	if (entry) return entry;

	for (const [statement, target] of reexportsOf(source, file)) {
		const clause = statement.exportClause;
		if (clause && ts.isNamespaceExport(clause)) continue;
		if (clause && ts.isNamedExports(clause)) {
			for (const element of clause.elements) {
				if (element.name.text !== name) continue;
				const local = (element.propertyName ?? element.name).text;
				const found = findOther(target, local, root, seen);
				if (found) return found;
			}
			continue;
		}
		const found = findOther(target, name, root, seen);
		if (found) return found;
	}
	return undefined;
}

/**
 * Returns the kind and TSDoc of the export `name` of the module `file`, following its
 * re-exports. When no declaration is found, the entry is a constant without doc and
 * `unresolved` receives a message naming the export and the module.
 */
export function readOther(
	file: string,
	name: string,
	root: string,
	unresolved: string[] = []
): ApiOther {
	const found = findOther(file, name, root, new Set());
	if (found) return found;
	unresolved.push(`${name} (exported from ${posixRelative(root, file)})`);
	return { kind: 'constant', source: posixRelative(root, file), doc: '' };
}

/** Returns the names declared with `export` in `statement`, or exported by a local `export { a as b }` list. */
function localExports(statement: ts.Statement): { exported: string; local: string }[] {
	if (ts.isExportDeclaration(statement)) {
		if (statement.moduleSpecifier || !statement.exportClause) return [];
		if (!ts.isNamedExports(statement.exportClause)) return [];
		return statement.exportClause.elements.map((element) => ({
			exported: element.name.text,
			local: (element.propertyName ?? element.name).text
		}));
	}
	if (!ts.canHaveModifiers(statement)) return [];
	const exported = ts
		.getModifiers(statement)
		?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
	if (!exported) return [];
	const names: string[] = [];
	if (ts.isVariableStatement(statement)) {
		for (const declaration of statement.declarationList.declarations)
			if (ts.isIdentifier(declaration.name)) names.push(declaration.name.text);
	} else if (
		(ts.isFunctionDeclaration(statement) ||
			ts.isClassDeclaration(statement) ||
			ts.isInterfaceDeclaration(statement) ||
			ts.isTypeAliasDeclaration(statement)) &&
		statement.name
	)
		names.push(statement.name.text);
	return names.map((name) => ({ exported: name, local: name }));
}

/**
 * Reads the public exports of the package index `index`, in declaration order: its
 * re-exports and the declarations it exports itself. `export * from` merges the exports
 * of the target module without overriding names already read; exports whose module or
 * declaration is not found are reported in `unresolved`.
 */
export function readPackage(
	index: string,
	root: string,
	unresolved: string[] = []
): Record<string, ApiEntry> {
	const source = parseModule(index);
	const entries: Record<string, ApiEntry> = {};
	for (const statement of source.statements) {
		for (const { exported, local } of localExports(statement))
			entries[exported] ??= readOther(index, local, root, unresolved);
		if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) continue;
		const specifier = (statement.moduleSpecifier as ts.StringLiteral).text;
		if (!specifier.startsWith('.')) continue;
		const target = resolveModule(index, specifier);
		const clause = statement.exportClause;
		if (clause && ts.isNamespaceExport(clause)) {
			const parts = readPackage(target, root, unresolved);
			const components = Object.fromEntries(
				Object.entries(parts).filter(
					(entry): entry is [string, ApiComponent] => entry[1].kind === 'component'
				)
			);
			if (Object.keys(components).length > 0)
				entries[clause.name.text] = { kind: 'compound', parts: components };
			continue;
		}
		if (!clause) {
			if (!existsSync(target)) {
				unresolved.push(`* (exported from ${posixRelative(root, index)})`);
				continue;
			}
			for (const [name, entry] of Object.entries(readPackage(target, root, unresolved)))
				entries[name] ??= entry;
			continue;
		}
		if (!ts.isNamedExports(clause)) continue;
		for (const element of clause.elements) {
			const exported = element.name.text;
			const local = (element.propertyName ?? element.name).text;
			if (entries[exported]) continue;
			if (target.endsWith('.svelte') && local === 'default') {
				if (existsSync(target)) entries[exported] = readComponent(target, root);
				else unresolved.push(`${exported} (exported from ${posixRelative(root, index)})`);
			} else entries[exported] = readOther(target, local, root, unresolved);
		}
	}
	return entries;
}
