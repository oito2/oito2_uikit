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
  A panel that slides in from a window edge (`side`). A `modal` sheet dims the page and
  keeps focus inside it; a click on the dimmed page closes it when `dismissible`. A
  non-modal sheet leaves the page usable beside it. Either closes on Escape and, when
  `dismissible`, when dragged toward its edge by its `Sheet.Handle`. A bottom sheet with
  `snapPoints` (fractions of the window height, ascending) rests at those heights, and its
  handle moves between them. Compose it with `Sheet.Trigger`, `Sheet.Content`,
  `Sheet.Title`, `Sheet.Handle` and `Sheet.Close`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SheetState, setSheet, type SheetSide } from '../sheet-state.svelte.js';

	interface Props {
		/** Whether the sheet is open. */
		open?: boolean;
		/** Whether an uncontrolled sheet starts open. */
		defaultOpen?: boolean;
		/** Called when the sheet opens or closes. */
		onOpenChange?: (open: boolean) => void;
		/** The edge the sheet slides in from. Defaults to `end`. */
		side?: SheetSide;
		/** Whether the sheet dims the page and keeps focus. Defaults to true. */
		modal?: boolean;
		/** Whether a click outside and a drag toward the edge close it. Defaults to true. */
		dismissible?: boolean;
		/** The heights a bottom sheet rests at, as fractions of the window height, ascending. */
		snapPoints?: readonly number[];
		/** The index of the snap point the sheet rests at. */
		snap?: number;
		/** The snap point an uncontrolled sheet opens at. Defaults to 0. */
		defaultSnap?: number;
		/** Called when the sheet moves to another snap point. */
		onSnapChange?: (snap: number) => void;
		/** The trigger and the content. */
		children: Snippet;
	}

	let {
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		side = 'end',
		modal = true,
		dismissible = true,
		snapPoints,
		snap = $bindable(),
		defaultSnap = 0,
		onSnapChange,
		children
	}: Props = $props();

	const id = $props.id();
	setSheet(
		new SheetState({
			id,
			open: () => open,
			defaultOpen: () => defaultOpen,
			onOpenChange: (next) => {
				open = next;
				onOpenChange?.(next);
			},
			side: () => side,
			modal: () => modal,
			dismissible: () => dismissible,
			snapPoints: () => snapPoints,
			snap: () => snap,
			defaultSnap: () => defaultSnap,
			onSnapChange: (next) => {
				snap = next;
				onSnapChange?.(next);
			}
		})
	);
</script>

{@render children()}
