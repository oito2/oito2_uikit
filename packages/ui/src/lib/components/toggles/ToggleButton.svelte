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
  A row that toggles a setting when clicked anywhere on it: any painted `control` next to a
  `title` and an optional `subtitle`, with one focus ring around the whole row. Prefer
  `CheckButton`, `RadioButton` and `SwitchButton`, which wire the control and the
  accessibility state; use this one for other controls.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import ToggleRow from './ToggleRow.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'title' | 'children'> {
		/** The control drawn in the row; it must not take focus itself. */
		control: Snippet;
		/** The main label. */
		title?: string | Snippet;
		/** A secondary line under the title. */
		subtitle?: string | Snippet;
		/** Whether the control comes after the text instead of before it. */
		controlAtEnd?: boolean;
		/** The button element. */
		ref?: HTMLButtonElement | null;
	}

	let { ref = $bindable(null), ...rest }: Props = $props();
</script>

<ToggleRow bind:ref {...rest} />
