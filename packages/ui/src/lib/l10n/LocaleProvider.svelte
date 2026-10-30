<!--
  Copyright (C) 2026  OITO2

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<!--
  @component
  Provides a locale and its strings to the components inside it, which read them with
  `useLocale()` and `useFormat()`. Renders no element of its own.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { localizationsFor, setLocale } from './locale.js';
	import type { Localizations } from './localizations.js';

	interface Props {
		/** The BCP 47 locale, such as `en` or `pt-BR`. Defaults to `en`. */
		locale?: string;
		/** Strings that replace the built-in ones for `locale`. */
		strings?: Localizations;
		/** The content that reads the locale. */
		children: Snippet;
	}

	let { locale = 'en', strings, children }: Props = $props();

	setLocale(() => ({ locale, strings: strings ?? localizationsFor(locale) }));
</script>

{@render children()}
