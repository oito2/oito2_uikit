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
  A modal dialog. Compose it with `Dialog.Trigger`, `Dialog.Content` and, inside the
  content, `Dialog.TitleBar` or `Dialog.Title`, `Dialog.Description`, `Dialog.Actions`
  and `Dialog.Close`. Bind `open`, or set `defaultOpen` and listen to `onOpenChange`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DialogState, setDialog } from '../dialog-state.svelte.js';

	interface Props {
		/** Whether the dialog is open. */
		open?: boolean;
		/** Whether an uncontrolled dialog starts open. Defaults to `false`. */
		defaultOpen?: boolean;
		/** Called when the dialog opens or closes. */
		onOpenChange?: (open: boolean) => void;
		/** The trigger and the content. */
		children: Snippet;
	}

	let { open = $bindable(), defaultOpen = false, onOpenChange, children }: Props = $props();

	const id = $props.id();
	setDialog(
		new DialogState({
			open: () => open,
			defaultOpen: () => defaultOpen,
			onOpenChange: (next) => {
				open = next;
				onOpenChange?.(next);
			},
			id
		})
	);
</script>

{@render children()}
