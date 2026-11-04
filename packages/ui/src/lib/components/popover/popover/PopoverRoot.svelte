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
  A non-modal panel anchored to an element, such as a picker or a short form. Compose it
  with `Popover.Trigger` (or `Popover.Anchor` and your own button) and `Popover.Content`.
  The panel opens on the content's `placement` side, moving to the other side when it
  doesn't fit, and follows the anchor as it moves. Escape and a click outside close it; a
  popover opened from inside another keeps the outer one open. Bind `open`, or set
  `defaultOpen` and listen to `onOpenChange`; or pass a `PopoverController` to open and
  close it from code.
-->
<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { PopoverController, PopoverState, setPopover } from '../popover-state.svelte.js';

	interface Props {
		/** Whether the panel is open. */
		open?: boolean;
		/** Whether an uncontrolled popover starts open. */
		defaultOpen?: boolean;
		/** Called when the panel opens or closes. */
		onOpenChange?: (open: boolean) => void;
		/** Opens and closes the panel from code; the root makes its own when unset. */
		controller?: PopoverController;
		/** The trigger, the anchor and the content. */
		children: Snippet;
	}

	let {
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		controller,
		children
	}: Props = $props();

	const id = $props.id();
	const own = new PopoverController({
		open: () => open,
		defaultOpen: untrack(() => defaultOpen),
		onOpenChange: (next) => {
			open = next;
			onOpenChange?.(next);
		}
	});
	// The controller is read once: a popover keeps the one it starts with.
	setPopover(new PopoverState(id, untrack(() => controller) ?? own));
</script>

{@render children()}
