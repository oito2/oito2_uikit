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

<!-- Test helper: prints what the context functions return. -->
<script lang="ts">
	import { useSystemSettings } from '../lib/foundation/system-scope.js';
	import { useFormat } from '../lib/format/format.js';
	import { useLocale } from '../lib/l10n/locale.js';

	const settings = useSystemSettings();
	const locale = useLocale();
	const format = useFormat();
</script>

<p data-testid="style">{settings.current.windowControlStyle}</p>
<p data-testid="accent">{settings.current.accentColor ?? 'none'}</p>
<p data-testid="locale">{locale.locale}</p>
<p data-testid="close">{locale.strings.closeWindow}</p>
<p data-testid="bytes">{format.current.bytes(1536)}</p>
