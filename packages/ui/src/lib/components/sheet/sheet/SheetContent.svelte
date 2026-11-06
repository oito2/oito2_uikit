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
  The panel of a sheet, sliding in from its edge. A side sheet is `size` pixels wide; a
  bottom sheet is as tall as its content up to 90% of the window, or rests at its snap
  points. A modal sheet traps focus and dims the page; focus returns where it was when it
  closes.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Portal from '../../../internal/Portal.svelte';
	import { dismissableLayer } from '../../../internal/dismissable-layer.js';
	import { focusScope } from '../../../internal/focus-scope.js';
	import { Presence } from '../../../internal/presence.svelte.js';
	import { lockScroll } from '../../../internal/scroll-lock.js';
	import { useSheet } from '../sheet-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The width of a side sheet, in pixels. Defaults to 360. */
		size?: number;
		/**
		 * Returns the element that takes focus when the panel closes and the element that
		 * had focus before it opened is gone, such as a list row its action removed.
		 */
		finalFocus?: () => HTMLElement | null | undefined;
		/** The panel element. */
		ref?: HTMLDivElement | null;
		/** The content. */
		children?: Snippet;
	}

	let {
		size = 360,
		finalFocus,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const sheet = useSheet();
	const presence = new Presence(() => sheet.open);

	$effect(() => {
		if (!presence.present || !sheet.modal) return;
		return lockScroll();
	});

	let snaps = $derived(sheet.snapPoints);
	let last = $derived(snaps?.at(-1) ?? 0);
	let rest_ = $derived(snaps ? (last - (snaps[sheet.snap] ?? last)) * 100 : 0);
</script>

{#if presence.present}
	<Portal>
		{#if sheet.modal}
			<div
				class="oito2-sheet-overlay"
				data-state={sheet.open ? 'open' : 'closed'}
				aria-hidden="true"
			></div>
		{/if}
		<div
			bind:this={ref}
			role="dialog"
			aria-modal={sheet.modal || undefined}
			aria-labelledby={sheet.hasTitle ? `${sheet.id}-title` : undefined}
			class={['oito2-sheet', className]}
			data-side={sheet.side}
			data-state={sheet.open ? 'open' : 'closed'}
			data-dragging={sheet.dragging ? '' : undefined}
			data-snaps={snaps ? '' : undefined}
			style:--oito2-sheet-size="{size}px"
			style:--oito2-sheet-height={snaps ? `${last * 100}vh` : undefined}
			style:--oito2-sheet-rest={snaps ? `${rest_}vh` : '0px'}
			style:--oito2-sheet-drag="{sheet.drag}px"
			{@attach presence.attach}
			{@attach sheet.open ? focusScope({ trap: sheet.modal, finalFocus }) : undefined}
			{@attach sheet.open
				? dismissableLayer({
						onDismiss: (reason) =>
							reason === 'escape' ? (sheet.open = false) : sheet.dismiss(),
						closeOnPointerOutside: sheet.modal
					})
				: undefined}
			{...rest}
		>
			{@render children?.()}
		</div>
	</Portal>
{/if}

<style>
	@layer oito2 {
		.oito2-sheet-overlay {
			position: fixed;
			inset: 0;
			z-index: 900;
			background: color-mix(in srgb, var(--oito2-color-scrim) 32%, transparent);
			animation: oito2-sheet-fade-in 250ms ease-out;
		}

		.oito2-sheet-overlay[data-state='closed'] {
			animation: oito2-sheet-fade-out 250ms ease-in forwards;
		}

		.oito2-sheet {
			--oito2-sheet-from: translateX(100%);
			position: fixed;
			z-index: 901;
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			overflow: auto;
			outline: none;
			background: var(--oito2-color-surface-container-low);
			color: var(--oito2-color-on-surface);
			box-shadow: 0 0 16px color-mix(in srgb, var(--oito2-color-shadow) 25%, transparent);
			animation: oito2-sheet-in 250ms cubic-bezier(0.215, 0.61, 0.355, 1);
			transition: transform 200ms cubic-bezier(0.215, 0.61, 0.355, 1);
		}

		[data-dragging] {
			transition: none;
		}

		[data-side='end'],
		[data-side='start'] {
			top: 0;
			bottom: 0;
			width: min(var(--oito2-sheet-size), 100vw);
		}

		[data-side='end'] {
			inset-inline-end: 0;
			border-start-start-radius: var(--oito2-radius-large);
			border-end-start-radius: var(--oito2-radius-large);
			transform: translateX(var(--oito2-sheet-drag));
		}

		[data-side='start'] {
			--oito2-sheet-from: translateX(-100%);
			inset-inline-start: 0;
			border-start-end-radius: var(--oito2-radius-large);
			border-end-end-radius: var(--oito2-radius-large);
			transform: translateX(calc(-1 * var(--oito2-sheet-drag)));
		}

		.oito2-sheet:dir(rtl)[data-side='end'] {
			--oito2-sheet-from: translateX(-100%);
			transform: translateX(calc(-1 * var(--oito2-sheet-drag)));
		}

		.oito2-sheet:dir(rtl)[data-side='start'] {
			--oito2-sheet-from: translateX(100%);
			transform: translateX(var(--oito2-sheet-drag));
		}

		[data-side='bottom'] {
			--oito2-sheet-from: translateY(100%);
			right: 0;
			bottom: 0;
			left: 0;
			max-height: 90vh;
			border-start-start-radius: var(--oito2-radius-large);
			border-start-end-radius: var(--oito2-radius-large);
			transform: translateY(calc(var(--oito2-sheet-rest) + var(--oito2-sheet-drag)));
		}

		[data-side='bottom'][data-snaps] {
			height: var(--oito2-sheet-height);
			max-height: none;
		}

		[data-state='closed'] {
			animation: oito2-sheet-out 200ms ease-in forwards;
		}

		@keyframes oito2-sheet-in {
			from {
				transform: var(--oito2-sheet-from);
			}
		}

		@keyframes oito2-sheet-out {
			to {
				transform: var(--oito2-sheet-from);
			}
		}

		@keyframes oito2-sheet-fade-in {
			from {
				opacity: 0;
			}
		}

		@keyframes oito2-sheet-fade-out {
			to {
				opacity: 0;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-sheet,
			.oito2-sheet-overlay,
			[data-state='closed'] {
				animation: none;
				transition: none;
			}
		}
	}
</style>
