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

import { colorSchemeRoles, type ColorTheme } from './color-theme.js';
import { syntaxRoles } from './syntax-palette.js';

// Converts camelCase to kebab-case.
function kebab(name: string): string {
	return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Returns the CSS custom properties of `theme`, keyed by property name:
 * `--oito2-color-<role>` for the Material roles, the background and the semantic colors
 * (`--oito2-color-primary-text`, `--oito2-color-success`…), `--oito2-chrome-<surface>`
 * and `--oito2-syntax-<role>`, with lowercase hex values.
 */
export function colorThemeVariables(theme: ColorTheme): Record<string, string> {
	const variables: Record<string, string> = {};
	const set = (name: string, value: string) => {
		variables[name] = value.toLowerCase();
	};
	for (const role of colorSchemeRoles)
		set(`--oito2-color-${kebab(role)}`, theme.colorScheme[role]);
	set('--oito2-color-background', theme.background);
	for (const [name, value] of Object.entries(theme.semantic))
		set(`--oito2-color-${kebab(name)}`, value);
	for (const [name, value] of Object.entries(theme.chrome))
		set(`--oito2-chrome-${kebab(name)}`, value);
	for (const role of syntaxRoles) set(`--oito2-syntax-${kebab(role)}`, theme.syntax[role]);
	return variables;
}

/** Returns the custom properties of `theme` as an inline `style` value. */
export function colorThemeStyle(theme: ColorTheme): string {
	const declarations = Object.entries(colorThemeVariables(theme)).map(
		([name, value]) => `${name}: ${value}`
	);
	declarations.push(`color-scheme: ${theme.brightness}`);
	return declarations.join('; ');
}

/** Returns a CSS rule that applies `theme` to the elements matching `selector`. */
export function colorThemeRule(theme: ColorTheme, selector: string, indent = ''): string {
	const lines = Object.entries(colorThemeVariables(theme)).map(
		([name, value]) => `${indent}\t${name}: ${value};`
	);
	lines.push(`${indent}\tcolor-scheme: ${theme.brightness};`);
	return [`${indent}${selector} {`, ...lines, `${indent}}`].join('\n');
}
