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
  A group of list box rows under a heading: `label`, or a `ListBox.GroupLabel` among the
  children.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setListBoxGroup } from '../list-box-state.svelte.js';
	import ListBoxGroupLabel from './ListBoxGroupLabel.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The heading. */
		label?: string;
		/** The rows, and a `ListBox.GroupLabel` when there is no `label`. */
		children?: Snippet;
	}

	let { label, children, class: className, ...rest }: Props = $props();

	const id = $props.id();
	const group = setListBoxGroup(id);
</script>

<div
	role="group"
	aria-labelledby={label || group.labels > 0 ? id : undefined}
	class={['oito2-list-box-group', className]}
	{...rest}
>
	{#if label}<ListBoxGroupLabel>{label}</ListBoxGroupLabel>{/if}
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-list-box-group {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}
	}
</style>
