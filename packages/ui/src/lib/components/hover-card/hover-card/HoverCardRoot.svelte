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
  A card of extra detail that opens over a `HoverCard.Trigger` while the pointer rests on
  it or keyboard focus is inside it, such as a profile preview on a user name. It opens
  after `openDelay` and closes `closeDelay` after the pointer leaves both the trigger and
  the card, or focus leaves the trigger. A long press opens it on touch screens; Escape
  and a click outside close it. The card doesn't take focus, so its content must only
  repeat or preview what the trigger leads to.
-->
<script lang="ts">
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import {
		PopoverController,
		PopoverState,
		setPopover
	} from '../../popover/popover-state.svelte.js';
	import { setHoverCard } from '../hover-card-context.js';

	interface Props {
		/** Whether the card is open. */
		open?: boolean;
		/** Called when the card opens or closes. */
		onOpenChange?: (open: boolean) => void;
		/** The wait before the card opens, in milliseconds. Defaults to 500. */
		openDelay?: number;
		/** The wait before the card closes, in milliseconds. Defaults to 300. */
		closeDelay?: number;
		/** The trigger and the content. */
		children: Snippet;
	}

	let {
		open = $bindable(),
		onOpenChange,
		openDelay = 500,
		closeDelay = 300,
		children
	}: Props = $props();

	const id = $props.id();
	const controller = new PopoverController({
		open: () => open,
		onOpenChange: (next) => {
			open = next;
			onOpenChange?.(next);
		}
	});
	setPopover(new PopoverState(id, controller));
	let timer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(timer));

	setHoverCard({
		schedule(next: boolean) {
			clearTimeout(timer);
			if (controller.isOpen === next) return;
			const delay = untrack(() => (next ? openDelay : closeDelay));
			timer = setTimeout(() => (next ? controller.open() : controller.close()), delay);
		},
		cancel() {
			clearTimeout(timer);
		},
		openNow() {
			clearTimeout(timer);
			controller.open();
		}
	});
</script>

{@render children()}
