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
  Provides `settings` to the components inside it, which read them with
  `useSystemSettings()`. Renders no element of its own.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setSystemSettings } from './system-scope.js';
	import type { SystemSettings } from './system-settings.js';

	interface Props {
		/** The settings provided to the components inside. */
		settings: SystemSettings;
		/** The content that reads the settings. */
		children: Snippet;
	}

	let { settings, children }: Props = $props();

	setSystemSettings(() => settings);
</script>

{@render children()}
