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
  The top row of a dialog: its title and a close button at the end.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import CloseButton from '../../button/CloseButton.svelte';
	import { useDialog } from '../dialog-state.svelte.js';
	import DialogTitle from './DialogTitle.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Whether the close button shows. Defaults to true. */
		closable?: boolean;
		/** The title. */
		children?: Snippet;
	}

	let { closable = true, class: className, children, ...rest }: Props = $props();

	const dialog = useDialog();
</script>

<div class={['oito2-dialog-title-bar', className]} {...rest}>
	<DialogTitle>{@render children?.()}</DialogTitle>
	{#if closable}<CloseButton onclick={() => (dialog.open = false)} />{/if}
</div>

<style>
	@layer oito2 {
		.oito2-dialog-title-bar {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			margin: calc(-1 * var(--oito2-space-sm)) calc(-1 * var(--oito2-space-sm)) 0 0;
		}
	}
</style>
