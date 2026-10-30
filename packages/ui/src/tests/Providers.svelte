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

<!-- Test helper: wraps ReadContext in a SystemScope and a LocaleProvider. -->
<script lang="ts">
	import LocaleProvider from '../lib/l10n/LocaleProvider.svelte';
	import type { Localizations } from '../lib/l10n/localizations.js';
	import SystemScope from '../lib/foundation/SystemScope.svelte';
	import type { SystemSettings } from '../lib/foundation/system-settings.js';
	import ReadContext from './ReadContext.svelte';

	interface Props {
		settings: SystemSettings;
		locale?: string;
		strings?: Localizations;
	}

	let { settings, locale, strings }: Props = $props();
</script>

<SystemScope {settings}>
	<LocaleProvider {locale} {strings}>
		<ReadContext />
	</LocaleProvider>
</SystemScope>
