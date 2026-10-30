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

<!-- Test helper: prints the theme that useTheme() returns. -->
<script lang="ts">
	import { useTheme } from '../lib/theme/theme-context.js';

	const theme = useTheme();
</script>

<p data-testid="theme-primary">{theme.current.colorScheme.primary}</p>
<p data-testid="theme-brightness">{theme.current.brightness}</p>
<p data-testid="theme-contrast">{theme.current.highContrast ? 'high' : 'normal'}</p>
