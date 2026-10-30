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
  The keyboard shortcut of a menu item, in the platform notation: give it a `Shortcut`, or
  text as `children`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useSystemSettings } from '../../../foundation/system-scope.js';
	import type { Shortcut } from '../../../shortcuts/shortcut.js';

	let { shortcut, children }: { shortcut?: Shortcut; children?: Snippet } = $props();

	const system = useSystemSettings();
</script>

<span class="oito2-menu-shortcut">
	{#if shortcut}{shortcut.label(system.current.platform.os)}{:else}{@render children?.()}{/if}
</span>

<style>
	@layer oito2 {
		.oito2-menu-shortcut {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-small);
			letter-spacing: var(--oito2-type-body-small-tracking);
		}
	}
</style>
