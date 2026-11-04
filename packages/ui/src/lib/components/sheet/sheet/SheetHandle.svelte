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
  The grip of a sheet. Dragging it toward the sheet's edge closes a dismissible sheet;
  on a bottom sheet with snap points it moves between them, and so do the Up and Down
  arrows, while a click, Enter or Space cycles to the next height.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { directionOf } from '../../../internal/keyboard.js';
	import { useLocale } from '../../../l10n/locale.js';
	import { settleSnap, useSheet } from '../sheet-state.svelte.js';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

	let { class: className, ...rest }: Props = $props();

	const sheet = useSheet();
	const locale = useLocale();
	let bottom = $derived(sheet.side === 'bottom');
	let snaps = $derived(sheet.snapPoints);
	let start = 0;
	let startTime = 0;
	let moved = false;
	let panelSize = 0;

	/** Returns the movement toward the sheet's edge of a pointer at `event`. */
	function toward(event: PointerEvent, node: HTMLElement): number {
		if (bottom) return event.clientY - start;
		const rtl = directionOf(node) === 'rtl';
		const towardRight = (sheet.side === 'end') !== rtl;
		return (event.clientX - start) * (towardRight ? 1 : -1);
	}

	function down(event: PointerEvent & { currentTarget: HTMLElement }) {
		if (event.button !== 0) return;
		const node = event.currentTarget;
		node.setPointerCapture(event.pointerId);
		start = bottom ? event.clientY : event.clientX;
		startTime = performance.now();
		moved = false;
		const panel = node.closest<HTMLElement>('.oito2-sheet');
		panelSize = panel ? (bottom ? panel.offsetHeight : panel.offsetWidth) : 1;
		sheet.dragging = true;
	}

	function move(event: PointerEvent & { currentTarget: HTMLElement }) {
		if (!sheet.dragging) return;
		const delta = toward(event, event.currentTarget);
		if (Math.abs(delta) > 3) moved = true;
		const floor =
			snaps && bottom
				? -((snaps.at(-1) ?? 0) - (snaps[sheet.snap] ?? 0)) * window.innerHeight
				: 0;
		sheet.drag = Math.max(floor, delta);
	}

	function up(event: PointerEvent & { currentTarget: HTMLElement }) {
		if (!sheet.dragging) return;
		sheet.dragging = false;
		const delta = toward(event, event.currentTarget);
		const velocity = (delta / Math.max(1, performance.now() - startTime)) * 1000;
		if (!moved) {
			sheet.drag = 0;
			return;
		}
		if (snaps && bottom) {
			const height = window.innerHeight;
			const offset = ((snaps.at(-1) ?? 0) - (snaps[sheet.snap] ?? 0)) * height + sheet.drag;
			const next = settleSnap(snaps, sheet.snap, offset, height, velocity, sheet.dismissible);
			sheet.drag = 0;
			if (next < 0) sheet.dismiss();
			else sheet.snap = next;
			return;
		}
		const dismiss = sheet.dismissible && (delta > panelSize * 0.4 || velocity > 700);
		sheet.drag = 0;
		if (dismiss) sheet.dismiss();
	}

	function cycle() {
		if (moved || !snaps) return;
		sheet.snap = (sheet.snap + 1) % snaps.length;
	}
</script>

{#if snaps}
	<button
		type="button"
		aria-label={locale.strings.resizeSheet}
		class={['oito2-sheet-handle', className]}
		data-side={sheet.side}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		onclick={cycle}
		onkeydown={(event) => {
			if (event.key === 'ArrowUp') sheet.snap += 1;
			else if (event.key === 'ArrowDown') sheet.snap -= 1;
			else if (event.key === 'Enter' || event.key === ' ') {
				moved = false;
				cycle();
			} else return;
			event.preventDefault();
		}}
		{...rest as HTMLAttributes<HTMLButtonElement>}
	>
		<span class="grip" aria-hidden="true"></span>
	</button>
{:else}
	<div
		role="presentation"
		class={['oito2-sheet-handle', className]}
		data-side={sheet.side}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		{...rest}
	>
		<span class="grip" aria-hidden="true"></span>
	</div>
{/if}

<style>
	@layer oito2 {
		.oito2-sheet-handle {
			display: flex;
			width: 100%;
			margin: 0;
			border: none;
			background: none;
			flex: none;
			align-items: center;
			justify-content: center;
			padding: var(--oito2-space-sm);
			cursor: grab;
			touch-action: none;
		}

		.oito2-sheet-handle:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: calc(-1 * var(--oito2-size-focus-border-width));
		}

		.grip {
			width: 32px;
			height: 4px;
			border-radius: 2px;
			background: var(--oito2-color-on-surface-variant);
			opacity: 0.4;
		}

		[data-side='start'],
		[data-side='end'] {
			position: absolute;
			top: 0;
			bottom: 0;
			inset-inline-start: 0;
			width: 12px;
			padding: 0;
		}

		[data-side='start'] {
			inset-inline: auto 0;
		}

		[data-side='start'] .grip,
		[data-side='end'] .grip {
			width: 4px;
			height: 32px;
		}
	}
</style>
