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
  A tooltip: a short label in the inverse surface color that shows next to its trigger
  after the pointer rests on it for `delay` milliseconds, or at once when the trigger gets
  keyboard focus. Compose it with `Tooltip.Trigger` and `Tooltip.Content`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { TooltipState, setTooltip } from './tooltip-state.svelte.js';

	interface Props {
		/** Whether the tooltip shows. */
		open?: boolean;
		/** Called when the tooltip opens or closes. */
		onOpenChange?: (open: boolean) => void;
		/** The hover delay in milliseconds. Defaults to 500. */
		delay?: number;
		/** Whether the tooltip never shows. */
		disabled?: boolean;
		/** The trigger and the content. */
		children: Snippet;
	}

	let {
		open = $bindable(),
		onOpenChange,
		delay = 500,
		disabled = false,
		children
	}: Props = $props();

	const id = $props.id();
	setTooltip(
		new TooltipState({
			open: () => open,
			onOpenChange: (next) => {
				open = next;
				onOpenChange?.(next);
			},
			delay: () => delay,
			disabled: () => disabled,
			id: `${id}-tooltip`
		})
	);
</script>

{@render children()}
