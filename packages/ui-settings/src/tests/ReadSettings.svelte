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

<!-- Test helper: shows the system settings it receives. -->
<script lang="ts">
	import { useSystemSettings } from '@oito2/ui';

	const settings = useSystemSettings();
</script>

<output data-testid="desktop">{settings.current.desktopEnvironment}</output>
<output data-testid="style">{settings.current.windowControlStyle}</output>
<output data-testid="layout"
	>{settings.current.windowButtonLayout.leading.join(
		','
	)}|{settings.current.windowButtonLayout.trailing.join(',')}</output
>
<output data-testid="accent">{settings.current.accentColor ?? 'none'}</output>
