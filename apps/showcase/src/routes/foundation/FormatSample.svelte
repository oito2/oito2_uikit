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

<!-- Shows the strings and formatter of the closest LocaleProvider. -->
<script lang="ts">
	import { useFormat, useLocale, useSystemSettings } from '@oito2/ui';

	const locale = useLocale();
	const format = useFormat();
	const settings = useSystemSettings();
	const now = new Date();
</script>

<dl>
	<dt>Locale</dt>
	<dd>{locale.locale}</dd>
	<dt>Window buttons</dt>
	<dd>
		{locale.strings.minimizeWindow} · {locale.strings.maximizeWindow} · {locale.strings
			.closeWindow}
		({settings.current.windowControlStyle})
	</dd>
	<dt>Bytes</dt>
	<dd>
		{format.current.bytes(1536)} · {format.current.bytes(2_500_000)} · {format.current.bytes(
			1_048_576,
			{
				units: 'iec'
			}
		)}
	</dd>
	<dt>Compact numbers</dt>
	<dd>{format.current.compactNumber(1234)} · {format.current.compactNumber(1_500_000)}</dd>
	<dt>Relative times</dt>
	<dd>
		{format.current.relativeTime(new Date(now.getTime() - 3 * 60_000), now)} ·
		{format.current.relativeTime(new Date(now.getTime() + 2 * 86_400_000), now)}
	</dd>
	<dt>Plural</dt>
	<dd>{locale.strings.resultCount(1)} · {locale.strings.resultCount(3)}</dd>
</dl>

<style>
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: var(--oito2-space-xs) var(--oito2-space-lg);
		margin: var(--oito2-space-md) 0 0;
	}

	dt {
		font-weight: var(--oito2-font-weight-emphasis);
	}

	dd {
		margin: 0;
	}
</style>
