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
  Shows the toasts of `toast()`: short messages in the inverse surface color, stacked at
  `placement`, up to `maxVisible` at once (the rest wait). A toast closes after its
  duration, by its close button or Escape, or by its action; the timers pause while the
  pointer is over the toasts, focus is inside them or the page is hidden. Screen readers
  hear each toast, a `danger` one at once. Place one `Toaster` inside the app's
  `ThemeProvider`.
-->
<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Contrast, ensureContrastColor } from '../../foundation/contrast.js';
	import { colorToHex } from '../../foundation/color.js';
	import Portal from '../../internal/Portal.svelte';
	import { useLocale } from '../../l10n/locale.js';
	import { useTheme } from '../../theme/theme-context.js';
	import { statusPalettes } from '../../tokens/values.js';
	import Button from '../button/Button.svelte';
	import IconButton from '../button/IconButton.svelte';
	import type { IconComponent } from '../icon.js';
	import { infoTypeIcons, infoTypeLabel, type InfoType } from '../info/info-type.js';
	import CircularProgress from '../progress/CircularProgress.svelte';
	import {
		toaster as defaultStore,
		type ToasterPlacement,
		type ToasterStore
	} from './toaster.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** Where the toasts stack. Defaults to `bottom`. */
		placement?: ToasterPlacement;
		/** How many toasts show at once. Defaults to 3. */
		maxVisible?: number;
		/** The largest toast width, in pixels. Defaults to 420. */
		maxWidth?: number;
		/** The toasts to render. Defaults to the ones of `toast()`. */
		store?: ToasterStore;
	}

	let {
		placement = 'bottom',
		maxVisible = 3,
		maxWidth = 420,
		store = defaultStore,
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const theme = useTheme();

	// Counts this toaster, with how many toasts it shows, among the views of the store.
	$effect.pre(() => {
		const count = maxVisible;
		const target = store;
		return untrack(() => target.addView(count));
	});

	let visible = $derived(store.entries.slice(0, maxVisible));

	let colors = $derived.by(() => {
		const scheme = theme.current.colorScheme;
		const inverse = statusPalettes[theme.current.brightness === 'light' ? 'dark' : 'light'];
		const on = (color: string, target: number) =>
			colorToHex(ensureContrastColor(color, [scheme.inverseSurface], target));
		const types: Record<InfoType, string> = {
			information: on(inverse.info, Contrast.nonTextAA),
			success: on(inverse.success, Contrast.nonTextAA),
			warning: on(inverse.warning, Contrast.nonTextAA),
			danger: on(inverse.error, Contrast.nonTextAA),
			important: on(scheme.inversePrimary, Contrast.nonTextAA)
		};
		return { types, action: on(scheme.inversePrimary, Contrast.textAA) };
	});
	let top = $derived(placement.startsWith('top'));
</script>

<Portal>
	<section
		aria-label={locale.strings.notifications}
		class={['oito2-toaster', className]}
		data-placement={placement}
		style:--oito2-toast-max-width="{maxWidth}px"
		style:--oito2-toast-action={colors.action}
		onpointerenter={() => store.setPaused(true)}
		onpointerleave={() => store.setPaused(false)}
		onfocusin={() => store.setPaused(true)}
		onfocusout={(event) => {
			if (!event.currentTarget.contains(event.relatedTarget as Node | null))
				store.setPaused(false);
		}}
		{@attach (node) => {
			// Escape closes the dismissible toast that holds the focus.
			const onKey = (event: KeyboardEvent) => {
				if (event.key !== 'Escape') return;
				const item = (event.target as Element | null)?.closest<HTMLElement>(
					'.toast[data-dismissible]'
				);
				if (!item) return;
				event.stopPropagation();
				store.dismiss(Number(item.dataset.id));
			};
			node.addEventListener('keydown', onKey);
			return () => node.removeEventListener('keydown', onKey);
		}}
		{...rest}
	>
		{#each visible as entry (entry.id)}
			{@const item = entry.toast}
			<div
				class="toast"
				role={item.type === 'danger' ? 'alert' : 'status'}
				aria-atomic="true"
				data-state={entry.closing ? 'closed' : 'open'}
				data-from={top ? 'top' : 'bottom'}
				onanimationend={(event) => {
					if (entry.closing && event.target === event.currentTarget)
						store.removed(entry.id);
				}}
				data-id={entry.id}
				data-dismissible={item.dismissible === false ? undefined : ''}
				{@attach (node) => {
					// Without an exit animation (reduced motion), the toast goes at once.
					if (entry.closing && node.getAnimations().length === 0) store.removed(entry.id);
				}}
			>
				{#if item.loading}
					<CircularProgress
						size={18}
						label={locale.strings.loading}
						class="oito2-toast-spinner"
					/>
				{:else if item.type}
					{@const Icon = infoTypeIcons[item.type]}
					<Icon
						size={18}
						role="img"
						aria-label={infoTypeLabel(item.type, locale.strings)}
						style="color: {colors.types[item.type]}; flex: none"
					/>
				{/if}
				<div class="text">
					<span class="title">{item.title}</span>
					{#if item.description}<span class="description">{item.description}</span>{/if}
				</div>
				{#if item.actionLabel && item.onAction}
					<Button
						variant="text"
						class="oito2-toast-action"
						onclick={() => {
							item.onAction?.();
							store.dismiss(entry.id);
						}}
					>
						{item.actionLabel}
					</Button>
				{/if}
				{#if item.dismissible !== false}
					<IconButton
						class="oito2-toast-close"
						icon={X as IconComponent}
						label={locale.strings.dismiss}
						onclick={() => store.dismiss(entry.id)}
					/>
				{/if}
			</div>
		{/each}
	</section>
</Portal>

<style>
	@layer oito2 {
		.oito2-toaster {
			position: fixed;
			z-index: 1100;
			display: flex;
			flex-direction: column-reverse;
			align-items: center;
			gap: var(--oito2-space-sm);
			width: min(var(--oito2-toast-max-width), calc(100vw - 2 * var(--oito2-space-md)));
			margin: var(--oito2-space-md);
			pointer-events: none;
		}

		[data-placement^='top'] {
			top: 0;
			flex-direction: column;
		}

		[data-placement^='bottom'] {
			bottom: 0;
		}

		[data-placement='top'],
		[data-placement='bottom'] {
			left: 50%;
			margin-inline: 0;
			translate: -50% 0;
		}

		[data-placement$='-start'] {
			inset-inline-start: 0;
			align-items: flex-start;
		}

		[data-placement$='-end'] {
			inset-inline-end: 0;
			align-items: flex-end;
		}

		.toast {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			box-sizing: border-box;
			max-width: 100%;
			padding: var(--oito2-space-sm);
			padding-inline-start: var(--oito2-space-lg);
			border-radius: var(--oito2-radius-large);
			background: var(--oito2-color-inverse-surface);
			color: var(--oito2-color-on-inverse-surface);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			box-shadow: 0 3px 10px color-mix(in srgb, var(--oito2-color-shadow) 30%, transparent);
			pointer-events: auto;
			animation: oito2-toast-in 220ms cubic-bezier(0.215, 0.61, 0.355, 1);
		}

		.toast[data-from='top'] {
			--oito2-toast-from: -30%;
		}

		.toast[data-state='closed'] {
			animation: oito2-toast-out 220ms ease-in forwards;
		}

		.text {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-width: 0;
			padding-block: var(--oito2-space-xs);
		}

		.title {
			font-weight: 600;
		}

		.description {
			opacity: 0.8;
		}

		.toast :global(.oito2-toast-action) {
			color: var(--oito2-toast-action);
		}

		.toast :global(.oito2-toast-close),
		.toast :global(.oito2-toast-spinner) {
			flex: none;
			color: var(--oito2-color-on-inverse-surface);
			--oito2-color-selected-fill: var(--oito2-color-on-inverse-surface);
		}

		@keyframes oito2-toast-in {
			from {
				opacity: 0;
				translate: 0 var(--oito2-toast-from, 30%);
			}
		}

		@keyframes oito2-toast-out {
			to {
				opacity: 0;
				translate: 0 var(--oito2-toast-from, 30%);
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.toast,
			.toast[data-state='closed'] {
				animation: none;
			}
		}
	}
</style>
