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
  The text of a dialog, which describes it for screen readers.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useDialog } from '../dialog-state.svelte.js';

	let {
		class: className,
		children,
		...rest
	}: Omit<HTMLAttributes<HTMLParagraphElement>, 'children'> & { children?: Snippet } = $props();

	const dialog = useDialog();
	$effect(() => {
		dialog.hasDescription = true;
		return () => (dialog.hasDescription = false);
	});
</script>

<p id={dialog.descriptionId} class={['oito2-dialog-description', className]} {...rest}>
	{@render children?.()}
</p>

<style>
	@layer oito2 {
		.oito2-dialog-description {
			margin: 0;
		}
	}
</style>
