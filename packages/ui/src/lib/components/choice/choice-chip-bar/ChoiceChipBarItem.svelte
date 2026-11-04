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
  A chip of a `ChoiceChipBar.Root` that selects `value`, with the children as its label.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconComponent } from '../../icon.js';
	import Chip from '../../surfaces/Chip.svelte';
	import { useChoiceChipBar } from './choice-chip-bar-context.js';

	interface Props {
		/** The value the chip selects. */
		value: string;
		/** An icon before the label, replaced by the check mark while selected. */
		icon?: IconComponent;
		/** Whether the chip can't be used. */
		disabled?: boolean;
		/** The chip element. */
		ref?: HTMLElement | null;
		/** The label. */
		children: Snippet;
	}

	let { value, icon, disabled = false, ref = $bindable(null), children }: Props = $props();

	const bar = useChoiceChipBar();
</script>

<Chip
	bind:ref
	variant="filter"
	{icon}
	selected={bar.value.includes(value)}
	showCheckmark={bar.showCheckmark}
	disabled={disabled || bar.disabled}
	onSelectedChange={() => bar.toggle(value)}
>
	{@render children()}
</Chip>
