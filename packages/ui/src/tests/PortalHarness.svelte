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

<!-- Test helper: portal content inside a dark ThemeProvider, reading a context value. -->
<script lang="ts">
	import { setContext } from 'svelte';
	import Portal from '../lib/internal/Portal.svelte';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import ReadContext from './PortalContext.svelte';

	let { text = 'portal' }: { text?: string } = $props();
	setContext('portal-test', 'from-provider');
</script>

<ThemeProvider mode="dark" accent="red" highContrast={false} data-testid="provider">
	<div data-testid="origin">
		<Portal>
			<p data-testid="ported" style="color: var(--oito2-color-primary)">{text}</p>
			<ReadContext />
		</Portal>
	</div>
</ThemeProvider>
