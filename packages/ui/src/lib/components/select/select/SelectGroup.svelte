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
  A group of select options under a small heading.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import MenuLabel from '../../menu/menu/MenuLabel.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The heading. */
		label?: string;
		/** The options. */
		children?: Snippet;
	}

	let { label, children, ...rest }: Props = $props();

	const id = $props.id();
</script>

<div role="group" aria-labelledby={label ? id : undefined} {...rest}>
	{#if label}<MenuLabel {id}>{label}</MenuLabel>{/if}
	{@render children?.()}
</div>
