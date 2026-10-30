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
  The title of a dialog, which names it for screen readers.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useDialog } from '../dialog-state.svelte.js';

	let {
		class: className,
		children,
		...rest
	}: Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> & { children?: Snippet } = $props();

	const dialog = useDialog();
	$effect(() => {
		dialog.hasTitle = true;
		return () => (dialog.hasTitle = false);
	});
</script>

<h2 id={dialog.titleId} class={['oito2-dialog-title', className]} {...rest}>
	{@render children?.()}
</h2>

<style>
	@layer oito2 {
		.oito2-dialog-title {
			flex: 1;
			margin: 0;
			font: var(--oito2-type-title-large);
			letter-spacing: var(--oito2-type-title-large-tracking);
		}
	}
</style>
