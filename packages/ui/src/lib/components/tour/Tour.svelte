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
  A guided tour of an interface, run by a `TourController`: the page dims except for a
  spotlight on the current step's target, and a card next to it shows the step with Back,
  Next (Done on the last step) and a skip button. The spotlight follows the target as the
  page moves, and the target scrolls into view. Escape skips, the arrows go back and
  forth. A step with `waitForTap` moves on when its target is clicked. Focus moves into
  the card and returns where it was when the tour ends; `onFinish` tells whether it was
  completed.
-->
<script lang="ts">
	import { autoUpdate } from '@floating-ui/dom';
	import X from '@lucide/svelte/icons/x';
	import { tick } from 'svelte';
	import Portal from '../../internal/Portal.svelte';
	import { floating } from '../../internal/floating.js';
	import { focusScope } from '../../internal/focus-scope.js';
	import { directionOf } from '../../internal/keyboard.js';
	import { useLocale } from '../../l10n/locale.js';
	import Button from '../button/Button.svelte';
	import IconButton from '../button/IconButton.svelte';
	import type { IconComponent } from '../icon.js';
	import { popoverPlacement } from '../popover/popover-state.svelte.js';
	import type { TourController, TourStep } from './tour-controller.svelte.js';

	interface Props {
		/** The tour to show. */
		controller: TourController;
		/** Called when the tour ends, with whether every step was gone through. */
		onFinish?: (completed: boolean) => void;
	}

	let { controller, onFinish }: Props = $props();

	const locale = useLocale();
	const id = $props.id();
	let target = $state<DOMRect | null>(null);
	let reference = $state<HTMLElement | null>(null);
	let wasActive = false;

	/** Returns the element of `step`, or `null` when it has none or its selector is invalid. */
	function elementOf(step: TourStep | null): Element | null {
		if (!step?.target) return null;
		if (typeof step.target === 'function') return step.target() ?? null;
		try {
			return document.querySelector(step.target);
		} catch {
			return null;
		}
	}

	/** The target of a step that appeared after the step began. */
	let found = $state<{ step: TourStep; element: Element } | null>(null);
	/** The element of the current step, or `null` while it has none. */
	let element = $derived.by(() => {
		const step = controller.step;
		if (found && found.step === step) return found.element;
		return elementOf(step);
	});

	// Waits for the target of the current step to appear in the page while it is missing.
	$effect(() => {
		const step = controller.step;
		if (!step?.target || element) return;
		const observer = new MutationObserver(() => {
			const next = elementOf(step);
			if (next) {
				observer.disconnect();
				found = { step, element: next };
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
		return () => observer.disconnect();
	});

	// Scrolls the target into view and follows its place as the page scrolls, resizes or
	// shifts while the step is shown.
	$effect(() => {
		const step = controller.step;
		const current = element;
		if (!step || !current) {
			target = null;
			return;
		}
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		current.scrollIntoView({ block: 'center', behavior: reduced ? 'instant' : 'smooth' });
		let shown: DOMRect | null = null;
		const measure = () => {
			const box = current.getBoundingClientRect();
			const pad = step.spotlightPadding ?? 6;
			const next = new DOMRect(
				box.x - pad,
				box.y - pad,
				box.width + 2 * pad,
				box.height + 2 * pad
			);
			if (
				next.x !== shown?.x ||
				next.y !== shown?.y ||
				next.width !== shown?.width ||
				next.height !== shown?.height
			) {
				shown = next;
				target = next;
			}
		};
		return autoUpdate(current, document.body, measure);
	});

	// Reports the end of a run.
	$effect(() => {
		const active = controller.isActive;
		if (wasActive && !active) onFinish?.(controller.completed);
		wasActive = active;
	});

	// A step that waits for a click on its target moves on after it.
	$effect(() => {
		const step = controller.step;
		const index = controller.index;
		if (!step?.waitForTap) return;
		const onClick = (event: MouseEvent) => {
			const clicked = element;
			if (clicked && event.target instanceof Node && clicked.contains(event.target))
				void tick().then(() => {
					if (controller.index === index) controller.next();
				});
		};
		document.addEventListener('click', onClick, true);
		return () => document.removeEventListener('click', onClick, true);
	});

	function onkeydown(event: KeyboardEvent) {
		const rtl = directionOf(event.currentTarget as Element) === 'rtl';
		if (event.key === 'Escape') controller.skip();
		else if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') && !controller.step?.waitForTap)
			controller.next();
		else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) controller.previous();
		else return;
		event.preventDefault();
	}

	let path = $derived.by(() => {
		const outer = 'M0 0H100000V100000H0Z';
		if (!target) return outer;
		const { x, y, width: w, height: h } = target;
		const r = Math.min(8, w / 2, h / 2);
		return `${outer}M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
	});
</script>

{#if controller.step && controller.index !== null}
	{@const step = controller.step}
	{@const index = controller.index}
	{@const last = index === controller.steps.length - 1}
	{@const waits = !!step.waitForTap && element !== null}
	<Portal>
		<svg
			class="oito2-tour-spotlight"
			aria-hidden="true"
			data-has-target={target ? '' : undefined}
		>
			<path d={path} fill-rule="evenodd" />
		</svg>
		{#if target}
			<span
				bind:this={reference}
				class="oito2-tour-target"
				style:left="{target.x}px"
				style:top="{target.y}px"
				style:width="{target.width}px"
				style:height="{target.height}px"
			></span>
		{/if}
		{#key index}
			<div
				role="dialog"
				tabindex="-1"
				aria-labelledby="{id}-title"
				aria-describedby={step.description ? `${id}-description` : undefined}
				class="oito2-tour-card"
				data-centered={target ? undefined : ''}
				{@attach reference
					? floating(() => reference, {
							placement: popoverPlacement(
								step.placement ?? 'bottom',
								'center',
								directionOf(document.documentElement)
							),
							offset: 8
						})
					: undefined}
				{@attach focusScope({ trap: true })}
				{onkeydown}
			>
				<div class="head">
					<h2 class="title" id="{id}-title">{step.title}</h2>
					<IconButton
						icon={X as IconComponent}
						label={locale.strings.tourSkip}
						data-autofocus={waits ? '' : undefined}
						onclick={() => controller.skip()}
					/>
				</div>
				{#if step.description}<p class="description" id="{id}-description">
						{step.description}
					</p>{/if}
				<div class="foot">
					<span class="progress"
						>{locale.strings.tourProgress(index + 1, controller.steps.length)}</span
					>
					{#if index > 0}
						<Button variant="text" onclick={() => controller.previous()}
							>{locale.strings.tourBack}</Button
						>
					{/if}
					{#if !waits}
						<Button data-autofocus="" onclick={() => controller.next()}>
							{last ? locale.strings.tourDone : locale.strings.tourNext}
						</Button>
					{/if}
				</div>
			</div>
		{/key}
	</Portal>
{/if}

<style>
	@layer oito2 {
		.oito2-tour-spotlight {
			position: fixed;
			inset: 0;
			z-index: 1050;
			width: 100vw;
			height: 100vh;
			fill: color-mix(in srgb, var(--oito2-color-scrim) 50%, transparent);
			pointer-events: none;
		}

		.oito2-tour-spotlight path {
			pointer-events: visiblePainted;
			transition: d 250ms cubic-bezier(0.215, 0.61, 0.355, 1);
		}

		.oito2-tour-target {
			position: fixed;
			pointer-events: none;
		}

		.oito2-tour-card {
			position: fixed;
			z-index: 1051;
			box-sizing: border-box;
			width: min(320px, calc(100vw - 16px));
			padding: var(--oito2-space-sm) var(--oito2-space-sm) var(--oito2-space-md)
				var(--oito2-space-lg);
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-medium);
			outline: none;
			background: var(--oito2-color-surface-container);
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			box-shadow: 0 4px 16px color-mix(in srgb, var(--oito2-color-shadow) 25%, transparent);
			animation: oito2-tour-in 200ms ease-out;
		}

		[data-centered] {
			top: 50%;
			left: 50%;
			translate: -50% -50%;
		}

		.head {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-sm);
		}

		.title {
			flex: 1;
			margin: 0;
			font: var(--oito2-type-title-medium);
			letter-spacing: var(--oito2-type-title-medium-tracking);
		}

		.description {
			margin: 0 var(--oito2-space-sm) var(--oito2-space-sm) 0;
		}

		.foot {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			padding-inline-end: var(--oito2-space-xs);
		}

		.progress {
			flex: 1;
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-small);
		}

		@keyframes oito2-tour-in {
			from {
				opacity: 0;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-tour-card {
				animation: none;
			}

			.oito2-tour-spotlight path {
				transition: none;
			}
		}
	}
</style>
