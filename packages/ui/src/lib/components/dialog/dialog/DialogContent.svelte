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
  The panel of a dialog, centered over a dimmed page while the dialog is open. Focus moves
  into it and stays there until it closes, then returns to where it was; the page behind
  doesn't scroll. Escape closes it, and so does a click outside unless `role` is
  `alertdialog`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Portal from '../../../internal/Portal.svelte';
	import { dismissableLayer } from '../../../internal/dismissable-layer.js';
	import { focusScope } from '../../../internal/focus-scope.js';
	import { Presence } from '../../../internal/presence.svelte.js';
	import { lockScroll } from '../../../internal/scroll-lock.js';
	import { useDialog } from '../dialog-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** `dialog`, or `alertdialog` for a dialog that asks to confirm something. */
		role?: 'dialog' | 'alertdialog';
		/** Whether a click outside the panel closes it. Defaults to true for `dialog`. */
		closeOnOutsideClick?: boolean;
		/** The panel element. */
		ref?: HTMLDivElement | null;
		/** The content. */
		children: Snippet;
	}

	let {
		role = 'dialog',
		closeOnOutsideClick,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const dialog = useDialog();
	const presence = new Presence(() => dialog.open);

	$effect(() => {
		if (!presence.present) return;
		return lockScroll();
	});
</script>

{#if presence.present}
	<Portal>
		<div class="oito2-dialog-overlay" data-state={dialog.open ? 'open' : 'closed'}>
			<div
				bind:this={ref}
				{role}
				aria-modal="true"
				aria-labelledby={dialog.hasTitle ? dialog.titleId : undefined}
				aria-describedby={dialog.hasDescription ? dialog.descriptionId : undefined}
				class={['oito2-dialog', className]}
				data-state={dialog.open ? 'open' : 'closed'}
				{@attach presence.attach}
				{@attach focusScope({ trap: true })}
				{@attach dismissableLayer({
					onDismiss: () => (dialog.open = false),
					closeOnPointerOutside: closeOnOutsideClick ?? role === 'dialog'
				})}
				{...rest}
			>
				{@render children()}
			</div>
		</div>
	</Portal>
{/if}

<style>
	@layer oito2 {
		.oito2-dialog-overlay {
			position: fixed;
			inset: 0;
			z-index: 900;
			display: grid;
			place-items: center;
			padding: var(--oito2-space-xl);
			background: rgb(0 0 0 / 54%);
			animation: oito2-dialog-fade-in 150ms ease-out;
		}

		.oito2-dialog-overlay[data-state='closed'] {
			animation: oito2-dialog-fade-out 150ms ease-in forwards;
		}

		.oito2-dialog {
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-lg);
			box-sizing: border-box;
			min-width: min(280px, 100%);
			max-width: min(560px, 100%);
			max-height: 100%;
			overflow: auto;
			padding: var(--oito2-space-xl);
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-window);
			outline: none;
			background: var(--oito2-chrome-dialog);
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			box-shadow:
				0 4px 8px 3px color-mix(in srgb, var(--oito2-color-shadow) 15%, transparent),
				0 1px 3px color-mix(in srgb, var(--oito2-color-shadow) 30%, transparent);
			animation: oito2-dialog-zoom-in 150ms ease-out;
		}

		.oito2-dialog[data-state='closed'] {
			animation: oito2-dialog-zoom-out 150ms ease-in forwards;
		}

		@keyframes oito2-dialog-fade-in {
			from {
				opacity: 0;
			}
		}

		@keyframes oito2-dialog-fade-out {
			to {
				opacity: 0;
			}
		}

		@keyframes oito2-dialog-zoom-in {
			from {
				opacity: 0;
				scale: 0.95;
			}
		}

		@keyframes oito2-dialog-zoom-out {
			to {
				opacity: 0;
				scale: 0.95;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-dialog-overlay,
			.oito2-dialog {
				animation: none !important;
			}
		}
	}
</style>
