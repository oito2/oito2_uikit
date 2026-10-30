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

import { getContext, hasContext, setContext } from 'svelte';
import { en } from './en.js';
import type { Localizations } from './localizations.js';
import { ptBR } from './pt-br.js';

/** The locales with built-in strings: English and Brazilian Portuguese. */
export const supportedLocales = ['en', 'pt-BR'] as const;

/**
 * Returns the built-in strings for `locale` (BCP 47, `_` also accepted): Portuguese for
 * any `pt` locale, English otherwise.
 */
export function localizationsFor(locale: string): Localizations {
	const language = locale.split(/[-_]/)[0]?.toLowerCase();
	return language === 'pt' ? ptBR : en;
}

/** A live view of the locale and strings: both properties always read the latest value. */
export interface LocaleRef {
	/** The BCP 47 locale for number, date and time formatting, such as `pt-BR`. */
	readonly locale: string;
	/** The built-in strings for that locale. */
	readonly strings: Localizations;
}

const key = Symbol('oito2.locale');

/**
 * Provides a locale and its strings to the components below the calling one. `get` is
 * called on every read, so a getter over a prop or `$state` keeps them reactive. Must be
 * called during component initialization.
 */
export function setLocale(get: () => LocaleRef): void {
	setContext<LocaleRef>(key, {
		get locale() {
			return get().locale;
		},
		get strings() {
			return get().strings;
		}
	});
}

/**
 * Returns the locale and strings of the closest `LocaleProvider` (or `setLocale`), or
 * English when there is none. Must be called during component initialization.
 */
export function useLocale(): LocaleRef {
	if (hasContext(key)) return getContext<LocaleRef>(key);
	return { locale: 'en', strings: en };
}
