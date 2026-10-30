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
  A dialog that asks the user to confirm an action: a title, a description and a confirm
  and a cancel button. Only the buttons and Escape close it. Bind `open` to show it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../button/Button.svelte';
	import * as Dialog from './dialog/index.js';

	interface Props {
		/** Whether the dialog is open. */
		open?: boolean;
		/** Called when the dialog opens or closes. */
		onOpenChange?: (open: boolean) => void;
		/** The question or the action to confirm. */
		title: string | Snippet;
		/** The consequences of the action. */
		description?: string | Snippet;
		/** The label of the confirm button. */
		confirmLabel: string;
		/** The label of the cancel button. */
		cancelLabel: string;
		/** Called when the action is confirmed. */
		onConfirm?: () => void;
		/** Called when the action is cancelled, with a button or Escape. */
		onCancel?: () => void;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		title,
		description,
		confirmLabel,
		cancelLabel,
		onConfirm,
		onCancel
	}: Props = $props();
</script>

{#snippet text(content: string | Snippet)}
	{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
{/snippet}

<Dialog.Root
	bind:open
	onOpenChange={(next) => {
		// The dialog closes by itself only through the cancel button or Escape.
		if (!next) onCancel?.();
		onOpenChange?.(next);
	}}
>
	<Dialog.Content role="alertdialog">
		<Dialog.Title>{@render text(title)}</Dialog.Title>
		{#if description}<Dialog.Description>{@render text(description)}</Dialog.Description>{/if}
		<Dialog.Actions>
			<Dialog.Close>{cancelLabel}</Dialog.Close>
			<Button
				data-autofocus
				onclick={() => {
					onConfirm?.();
					open = false;
					onOpenChange?.(false);
				}}>{confirmLabel}</Button
			>
		</Dialog.Actions>
	</Dialog.Content>
</Dialog.Root>
