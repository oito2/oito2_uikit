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
  A section whose content an `Expandable.Trigger` shows and hides. Bind `open`, or set
  `defaultOpen` and listen to `onOpenChange`. Compose it with `Expandable.Trigger` and
  `Expandable.Content`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Controllable } from '../../../internal/controllable.svelte.js';
	import { ExpandableState, setExpandable } from '../expandable-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Whether the content is shown. */
		open?: boolean;
		/** Whether an uncontrolled section starts open. Defaults to false. */
		defaultOpen?: boolean;
		/** Called with each new state. */
		onOpenChange?: (open: boolean) => void;
		/** Whether the trigger can't be used. */
		disabled?: boolean;
		/** The section element. */
		ref?: HTMLDivElement | null;
		/** The trigger and the content. */
		children?: Snippet;
	}

	let {
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		disabled = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const id = $props.id();
	const value = new Controllable({
		value: () => open,
		defaultValue: () => defaultOpen,
		onChange: (next) => {
			open = next;
			onOpenChange?.(next);
		}
	});
	const state = setExpandable(
		new ExpandableState({
			id,
			open: () => value.current,
			setOpen: (next) => (value.current = next),
			disabled: () => disabled
		})
	);
</script>

<div
	bind:this={ref}
	class={['oito2-expandable', className]}
	data-state={state.open ? 'open' : 'closed'}
	{...rest}
>
	{@render children?.()}
</div>

<style>
	@layer oito2 {
		.oito2-expandable {
			display: flex;
			flex-direction: column;
		}
	}
</style>
