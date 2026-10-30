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

<!-- Test helper: a ThemeProvider, optionally inside a SystemScope, around ReadTheme. -->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import SystemScope from '../lib/foundation/SystemScope.svelte';
	import type { SystemSettings } from '../lib/foundation/system-settings.js';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import ReadTheme from './ReadTheme.svelte';

	type ProviderProps = Omit<ComponentProps<typeof ThemeProvider>, 'children'>;

	interface Props extends ProviderProps {
		settings?: SystemSettings;
	}

	let { settings, ...provider }: Props = $props();
</script>

{#if settings}
	<SystemScope {settings}>
		<ThemeProvider data-testid="provider" {...provider}><ReadTheme /></ThemeProvider>
	</SystemScope>
{:else}
	<ThemeProvider data-testid="provider" {...provider}><ReadTheme /></ThemeProvider>
{/if}
