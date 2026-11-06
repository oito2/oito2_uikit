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
  A list of the sections of a scrolling view that highlights the section in view and
  scrolls to a section when it is picked, moving the focus to its heading and the page's
  URL fragment to its id. Each entry points at its heading by element id.
  The current section is the last one whose heading has reached `activationOffset`
  pixels below the top of the view, or the last section when the view is scrolled to the
  end. The view is `scrollContainer`, or the page when it isn't given.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { tocActiveIndex, type TocEntry } from './toc-active.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** The sections, in document order. */
		entries: readonly TocEntry[];
		/** The scrolling element that holds the headings. Defaults to the page. */
		scrollContainer?: HTMLElement | null;
		/** How far below the top of the view a heading makes its section current, in pixels. Defaults to 32. */
		activationOffset?: number;
		/** Called with the index of a picked section, before the view scrolls to it. */
		onSelect?: (index: number) => void;
		/** The index of the current section; read it with `bind:active`. */
		active?: number;
		/** The list element, a `nav`. */
		ref?: HTMLElement | null;
	}

	let {
		entries,
		scrollContainer = null,
		activationOffset = 32,
		onSelect,
		active = $bindable(0),
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	/** Recomputes the current section from the scroll position. */
	function update() {
		const root = scrollContainer;
		const viewTop = root ? root.getBoundingClientRect().top : 0;
		const scrollTop = root ? root.scrollTop : window.scrollY;
		const max = root
			? root.scrollHeight - root.clientHeight
			: document.documentElement.scrollHeight - window.innerHeight;
		const headings = entries.map((entry) => {
			const element = document.getElementById(entry.id);
			return element ? element.getBoundingClientRect().top - viewTop : null;
		});
		active = tocActiveIndex({
			headings,
			activationOffset,
			atEnd: max > 0 && scrollTop >= max - 1,
			previous: active
		});
	}

	$effect(() => {
		void entries;
		void activationOffset;
		const target: HTMLElement | Window = scrollContainer ?? window;
		let frame = 0;
		const schedule = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(update);
		};
		target.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		schedule();
		return () => {
			cancelAnimationFrame(frame);
			target.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		};
	});

	/**
	 * Reports `index`, scrolls its heading into view, focuses the heading (making it
	 * focusable from script when it isn't) and sets the URL fragment to its id.
	 */
	function select(event: MouseEvent, index: number) {
		event.preventDefault();
		onSelect?.(index);
		const entry = entries[index];
		const heading = entry ? document.getElementById(entry.id) : null;
		if (!entry || !heading) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		heading.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
		if (heading.tabIndex < 0 && !heading.hasAttribute('tabindex'))
			heading.setAttribute('tabindex', '-1');
		heading.focus({ preventScroll: true });
		if (location.hash !== `#${entry.id}`)
			history.replaceState(history.state, '', `#${encodeURIComponent(entry.id)}`);
	}
</script>

<nav bind:this={ref} class={['oito2-toc', className]} {...rest}>
	<ul>
		{#each entries as entry, index (entry.id)}
			<li>
				<a
					href="#{entry.id}"
					class="entry"
					aria-current={index === active ? 'location' : undefined}
					data-state={index === active ? 'active' : undefined}
					style:--oito2-toc-depth={entry.depth ?? 0}
					onclick={(event) => select(event, index)}
				>
					{entry.title}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	@layer oito2 {
		ul {
			display: flex;
			flex-direction: column;
			margin: 0;
			padding: 0;
			list-style: none;
		}

		.entry {
			position: relative;
			display: block;
			padding-block: calc(var(--oito2-space-xs) + 2px);
			padding-inline: calc(var(--oito2-space-md) + var(--oito2-toc-depth) * 12px)
				var(--oito2-space-sm);
			border-inline-start: 2px solid var(--oito2-color-outline-variant);
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			text-decoration: none;
		}

		.entry::after {
			content: '';
			position: absolute;
			inset: 0;
			background: var(--oito2-color-on-surface);
			opacity: 0;
			pointer-events: none;
		}

		.entry:hover::after {
			opacity: 0.04;
		}

		.entry:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: calc(-1 * var(--oito2-size-focus-border-width));
		}

		.entry[data-state='active'] {
			border-inline-start-color: var(--oito2-color-primary-text);
			color: var(--oito2-color-primary-text);
			font-weight: 600;
		}
	}
</style>
