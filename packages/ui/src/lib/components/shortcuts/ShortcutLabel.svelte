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
  A keyboard shortcut drawn as key caps, in the platform's form: `Ctrl` `K` on Linux and
  Windows, `⌘K` on macOS. Screen readers hear the shortcut as text. The platform comes
  from the closest `SystemScope` unless `os` is given.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { OperatingSystem } from '../../foundation/platform.js';
	import { useSystemSettings } from '../../foundation/system-scope.js';
	import { usesCommandKey, type Shortcut } from '../../shortcuts/shortcut.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** The shortcut. */
		shortcut: Shortcut;
		/** The platform to label it for. Defaults to the system's. */
		os?: OperatingSystem;
	}

	let { shortcut, os, class: className, ...rest }: Props = $props();

	const system = useSystemSettings();
	let platform = $derived(os ?? system.current.platform.os);
	let apple = $derived(usesCommandKey(platform));
</script>

<span class={['oito2-shortcut-label', className]} {...rest}>
	<span class="text">{shortcut.label(platform)}</span>
	<kbd class="caps" aria-hidden="true">
		{#each shortcut.chords as chord, index (index)}
			<span class="chord">
				{#if apple}
					<kbd class="cap">{chord.label(platform)}</kbd>
				{:else}
					{#each chord.parts(platform) as part, at (at)}<kbd class="cap">{part}</kbd
						>{/each}
				{/if}
			</span>
		{/each}
	</kbd>
</span>

<style>
	@layer oito2 {
		.oito2-shortcut-label {
			display: inline-flex;
		}

		/* The shortcut as text for assistive technologies; the caps show it. */
		.text {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}

		.caps {
			display: inline-flex;
			flex-wrap: wrap;
			align-items: center;
			gap: var(--oito2-space-sm);
			font: inherit;
		}

		.chord {
			display: inline-flex;
			gap: var(--oito2-space-xxs);
		}

		.cap {
			box-sizing: border-box;
			min-width: 20px;
			padding: 1px var(--oito2-space-xs);
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-small);
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-label-small);
			letter-spacing: var(--oito2-type-label-small-tracking);
			text-align: center;
		}
	}
</style>
