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
  A tree of the nodes of `collection`, with the open, selected and checked nodes kept in
  `controller`.

  Only the rows in view are rendered, so it handles large trees; give it a height. The tree
  takes the focus as a whole and marks its active row:

  - Up, Down, Home and End move the active row; a single-selection tree selects it, and
    Shift extends a multiple selection.
  - Right opens a branch or moves to its first child; Left closes it or moves to the parent
    (swapped in right-to-left layouts). `*` opens every branch at the level of the active row.
  - Space toggles the check box of a `checkable` tree, or else the selection of a
    multiple-selection one; Control+A (Command+A) selects every shown, enabled node of a
    multiple-selection tree.
  - Enter, or a double click, calls `onActivate`, or opens or closes a branch when it is
    not set.
  - F2 starts an inline rename of the active node when `onRename` is set; Enter or leaving
    the field confirms it and Escape cancels it.
  - Typing letters jumps to the next shown label that starts with them.

  A branch with no children yet and an `onLoadChildren` shows a spinner while its children
  load the first time it opens. A non-empty `query` shows only the matching nodes and their
  ancestors, all open, with the match highlighted; branches can't be opened or closed while
  filtering.
-->
<script lang="ts" generics="T">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SvelteSet } from 'svelte/reactivity';
	import { foldText } from '../../collections/text-folding.js';
	import {
		isTreeBranch,
		treeNodeLabel,
		type TreeCollection,
		type TreeEntry,
		type TreeNode
	} from '../../collections/tree-collection.js';
	import { directionOf } from '../../internal/keyboard.js';
	import { mergeProps } from '../../internal/merge-props.js';
	import { typeaheadTimeout } from '../../internal/typeahead.js';
	import { useLocale } from '../../l10n/locale.js';
	import CircularProgress from '../progress/CircularProgress.svelte';
	import HighlightedText from '../text/HighlightedText.svelte';
	import CheckboxMark from '../toggles/CheckboxMark.svelte';
	import { treeCheckStates } from './tree-check.js';
	import { TreeController } from './tree-controller.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The nodes of the tree. */
		collection: TreeCollection<T>;
		/** The open, selected and checked nodes; the tree keeps its own when left out. */
		controller?: TreeController;
		/** The content of a row after its disclosure, check box and icon; the label by default. */
		item?: Snippet<[TreeNode<T>]>;
		/** The icon before the label, given the node and whether it is open. */
		icon?: Snippet<[TreeNode<T>, boolean]>;
		/** Called on Enter or a double click on a node; when not set, those open or close a branch. */
		onActivate?: (node: TreeNode<T>) => void;
		/**
		 * Loads the children of an empty branch the first time it opens; the app adds them to
		 * `collection`. When the promise rejects, the branch closes, `onLoadError` is called
		 * (the error is logged when it isn't set) and opening the branch again retries.
		 */
		onLoadChildren?: (node: TreeNode<T>) => Promise<void>;
		/** Called when `onLoadChildren` rejects. */
		onLoadError?: (error: unknown, node: TreeNode<T>) => void;
		/**
		 * Called with a node and its new, trimmed label when a rename is confirmed with a
		 * non-empty label that differs from the old one; F2 renames nothing when not set.
		 */
		onRename?: (node: TreeNode<T>, label: string) => void;
		/** Whether the rows have tristate check boxes, tracked in `controller.checked`. */
		checkable?: boolean;
		/** The text that filters the nodes; blank shows the whole tree. */
		query?: string;
		/** The row height in pixels; defaults to the control height of the density. */
		rowHeight?: number;
		/** The indent of each level in pixels. Defaults to 16. */
		indent?: number;
		/** The rows rendered beyond each edge of the view. Defaults to 8. */
		overscan?: number;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		collection,
		controller: controllerProp,
		item,
		icon,
		onActivate,
		onLoadChildren,
		onLoadError,
		onRename,
		checkable = false,
		query = '',
		rowHeight,
		indent = 16,
		overscan = 8,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const id = $props.id();
	const locale = useLocale();
	const ownController = new TreeController();
	let controller = $derived(controllerProp ?? ownController);

	/** The space above the first row and below the last one, in pixels. */
	const padding = 4;

	let active: string | null = $state(null);
	let anchor: string | null = null;
	let renaming: string | null = $state(null);
	let focused = $state(false);
	let keyboard = $state(false);
	let scrollTop = $state(0);
	let viewport = $state(0);
	let measuredRow = $state(34);
	const loading = new SvelteSet<string>();
	const loaded = new SvelteSet<string>();
	let typed = '';
	let typedTimer: ReturnType<typeof setTimeout> | undefined;

	let trimmedQuery = $derived(query.trim());
	let filtering = $derived(trimmedQuery !== '');
	let filtered = $derived(filtering ? collection.search(trimmedQuery) : null);
	let source = $derived(filtered ?? collection);
	let entries: TreeEntry<T>[] = $derived(
		filtered ? filtered.flatten() : collection.visible(controller.expanded)
	);
	let indexes = $derived(new Map(entries.map((entry, i) => [entry.node.value, i])));
	let checkStates = $derived(checkable ? treeCheckStates(collection, controller.checked) : null);
	let row = $derived(rowHeight ?? measuredRow);
	let multiple = $derived(controller.selectionMode === 'multiple');

	/** The rows to render: those in view plus the overscan, and the active row. */
	let rendered = $derived.by(() => {
		const first = Math.max(0, Math.floor((scrollTop - padding) / row) - overscan);
		const last = Math.min(
			entries.length - 1,
			Math.ceil((scrollTop + viewport - padding) / row) + overscan
		);
		const result: number[] = [];
		const activeIndex = indexOf(active);
		if (activeIndex >= 0 && activeIndex < first) result.push(activeIndex);
		for (let i = first; i <= last; i++) result.push(i);
		if (activeIndex > last) result.push(activeIndex);
		return result;
	});

	// Forgets the active, anchor and renamed rows once they are no longer shown.
	$effect(() => {
		if (active !== null && !indexes.has(active)) active = null;
		if (renaming !== null && !indexes.has(renaming)) renaming = null;
	});

	// Measures the view and reads the control height of the density.
	$effect(() => {
		const element = ref;
		if (!element) return;
		const measure = () => {
			viewport = element.clientHeight;
			const control = parseFloat(
				getComputedStyle(element).getPropertyValue('--oito2-control-height')
			);
			if (control > 0) measuredRow = control;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	});

	function indexOf(value: string | null): number {
		return value === null ? -1 : (indexes.get(value) ?? -1);
	}

	function rowId(index: number): string {
		return `${id}-row-${index}`;
	}

	/** Whether `node` shows as open; every branch is open while filtering. */
	function isOpen(node: TreeNode<T>): boolean {
		return filtering || controller.isExpanded(node.value);
	}

	/** Scrolls the row at `index` fully into view, with the list padding around it. */
	function reveal(index: number): void {
		const element = ref;
		if (!element || index < 0) return;
		const top = padding + index * row;
		const bottom = top + row;
		if (top - padding < element.scrollTop) element.scrollTop = Math.max(0, top - padding);
		else if (bottom + padding > element.scrollTop + element.clientHeight)
			element.scrollTop = bottom + padding - element.clientHeight;
		scrollTop = element.scrollTop;
	}

	/**
	 * Makes `value` active and reveals it; a single-selection tree selects it, and with
	 * `extend` a multiple-selection tree selects the enabled rows from the anchor to it.
	 */
	function activate(value: string, extend = false): void {
		active = value;
		const mode = controller.selectionMode;
		if (mode === 'single') {
			controller.setSelected([value]);
			anchor = value;
		} else if (mode === 'multiple' && extend) {
			const to = indexOf(value);
			let from = indexOf(anchor);
			// Falls back to the target when the anchor is no longer shown.
			if (from < 0) {
				from = to;
				anchor = value;
			}
			const range = entries.slice(Math.min(from, to), Math.max(from, to) + 1);
			controller.setSelected(range.filter((e) => !e.node.disabled).map((e) => e.node.value));
		} else if (!extend) {
			anchor = value;
		}
		reveal(indexOf(value));
	}

	/** Opens or closes the branch `node`, loading its children the first time an empty branch opens. */
	async function setExpanded(node: TreeNode<T>, expanded: boolean): Promise<void> {
		if (!isTreeBranch(node) || filtering) return;
		controller.setExpanded(node.value, expanded);
		const value = node.value;
		if (
			!expanded ||
			!onLoadChildren ||
			(node.children?.length ?? 0) > 0 ||
			loaded.has(value) ||
			loading.has(value)
		)
			return;
		loading.add(value);
		try {
			await onLoadChildren(node);
			loaded.add(value);
		} catch (error) {
			controller.setExpanded(value, false);
			if (onLoadError) onLoadError(error, node);
			else console.error('oito2: failed to load tree children', error);
		} finally {
			loading.delete(value);
		}
	}

	/** Runs the primary action of `node`: `onActivate`, or opening or closing a branch. */
	function primary(node: TreeNode<T>): void {
		if (onActivate) onActivate(node);
		else if (isTreeBranch(node)) void setExpanded(node, !controller.isExpanded(node.value));
	}

	/** Toggles the check box of `node`, or else its selection in a multiple-selection tree. */
	function toggleSpace(node: TreeNode<T>): void {
		if (checkable) controller.toggleChecked(collection, node.value);
		else if (multiple) controller.toggleSelected(node.value);
	}

	/** Returns the value of the first enabled row from `from` + `delta` on, or `null`. */
	function step(from: number, delta: number): string | null {
		for (let i = from + delta; i >= 0 && i < entries.length; i += delta) {
			const entry = entries[i];
			if (entry && !entry.node.disabled) return entry.node.value;
		}
		return null;
	}

	/**
	 * Adds `character` to the typed prefix, which resets after a pause, and activates the
	 * next enabled row after `index` whose label starts with it; repeating one character
	 * cycles through its matches.
	 */
	function typeAhead(character: string, index: number): void {
		clearTimeout(typedTimer);
		typedTimer = setTimeout(() => (typed = ''), typeaheadTimeout);
		const repeat = typed === character;
		typed = repeat ? character : typed + character;
		const needle = foldText(typed);
		const start = repeat || typed.length === 1 ? index + 1 : Math.max(index, 0);
		for (let n = 0; n < entries.length; n++) {
			const entry = entries[(start + n) % entries.length];
			if (
				entry &&
				!entry.node.disabled &&
				foldText(treeNodeLabel(entry.node)).startsWith(needle)
			) {
				activate(entry.node.value);
				return;
			}
		}
	}

	function onkeydown(event: KeyboardEvent): void {
		keyboard = true;
		if (renaming !== null || entries.length === 0 || event.altKey) return;
		const command = event.ctrlKey || event.metaKey;
		const index = indexOf(active);
		const current = index < 0 ? undefined : entries[index];
		const rtl = ref ? directionOf(ref) === 'rtl' : false;
		const openKey = rtl ? 'ArrowLeft' : 'ArrowRight';
		const closeKey = rtl ? 'ArrowRight' : 'ArrowLeft';
		const target = (value: string | null) => {
			if (value !== null) activate(value, event.shiftKey);
		};
		switch (event.key) {
			case 'ArrowDown':
				target(current ? step(index, 1) : step(-1, 1));
				break;
			case 'ArrowUp':
				target(current ? step(index, -1) : step(entries.length, -1));
				break;
			case 'Home':
				target(step(-1, 1));
				break;
			case 'End':
				target(step(entries.length, -1));
				break;
			case openKey: {
				if (!current) return;
				const node = current.node;
				if (isTreeBranch(node) && !isOpen(node)) void setExpanded(node, true);
				else if (isTreeBranch(node)) {
					const child = entries[index + 1];
					if (child && child.depth > current.depth) activate(child.node.value);
				}
				break;
			}
			case closeKey: {
				if (!current) return;
				const node = current.node;
				if (isTreeBranch(node) && isOpen(node) && !filtering) void setExpanded(node, false);
				else {
					const parent = collection.parentOf(node.value);
					if (parent !== null && indexOf(parent) >= 0) activate(parent);
				}
				break;
			}
			case '*':
				if (!current) return;
				for (const sibling of collection.siblingsOf(current.node.value))
					if (isTreeBranch(sibling) && !isOpen(sibling)) void setExpanded(sibling, true);
				break;
			case 'Enter':
				if (!current) return;
				primary(current.node);
				break;
			case ' ':
				if (!current) return;
				toggleSpace(current.node);
				break;
			case 'F2':
				if (!current || !onRename || current.node.disabled) return;
				renaming = current.node.value;
				break;
			default:
				if ((event.key === 'a' || event.key === 'A') && command) {
					if (!multiple) return;
					controller.setSelected(
						entries.filter((e) => !e.node.disabled).map((e) => e.node.value)
					);
					break;
				}
				if (event.key.length !== 1 || event.key.trim() === '' || command) return;
				typeAhead(event.key, index);
		}
		event.preventDefault();
	}

	function onfocus(event: FocusEvent): void {
		if (event.target !== ref) return;
		focused = true;
		// Shows the active row when the browser shows a focus ring, as after Tab.
		keyboard = ref?.matches(':focus-visible') ?? false;
		if (active === null && entries.length > 0) {
			const selected = entries.find((e) => controller.isSelected(e.node.value));
			active = (selected ?? entries[0])?.node.value ?? null;
		}
	}

	/**
	 * Focuses the tree and activates `node`, toggling it with Control or Command and
	 * extending the selection with Shift in a multiple-selection tree.
	 */
	function onRowClick(event: MouseEvent, node: TreeNode<T>): void {
		if (node.disabled) return;
		ref?.focus({ preventScroll: true });
		keyboard = false;
		if (multiple && (event.ctrlKey || event.metaKey)) {
			active = node.value;
			controller.toggleSelected(node.value);
			anchor = node.value;
		} else if (multiple && event.shiftKey) {
			activate(node.value, true);
		} else {
			active = node.value;
			anchor = node.value;
			if (controller.selectionMode !== 'none') controller.setSelected([node.value]);
		}
	}

	/** Ends the rename of `node` with `text`, or cancels it when `text` is `null`. */
	function finishRename(node: TreeNode<T>, text: string | null): void {
		if (renaming !== node.value) return;
		renaming = null;
		if (text !== null && text !== '' && text !== treeNodeLabel(node)) onRename?.(node, text);
		ref?.focus({ preventScroll: true });
	}

	/** Focuses the rename field and selects its text. */
	function renameField(input: HTMLInputElement): void {
		input.focus();
		input.select();
	}

	function checkState(value: string): boolean | 'mixed' {
		return checkStates?.get(value) ?? false;
	}
</script>

<div
	bind:this={ref}
	role="tree"
	tabindex="0"
	aria-multiselectable={multiple || undefined}
	aria-activedescendant={focused && active !== null && renaming === null
		? rowId(indexOf(active))
		: undefined}
	class={['oito2-tree-view', className]}
	data-keyboard={keyboard ? '' : undefined}
	style:--oito2-tree-row-height="{row}px"
	style:--oito2-tree-indent="{indent}px"
	{...mergeProps(rest, {
		onkeydown,
		onfocus,
		onblur: (event: FocusEvent) => {
			if (event.target === ref && !ref?.contains(event.relatedTarget as Node | null))
				focused = false;
		},
		onpointerdown: () => (keyboard = false),
		onscroll: () => (scrollTop = ref?.scrollTop ?? 0)
	})}
>
	<div class="oito2-tree-view-rows" role="presentation" style:height="{entries.length * row}px">
		{#each rendered as index (entries[index]?.node.value)}
			{@const entry = entries[index] as TreeEntry<T>}
			{@const node = entry.node}
			{@const open = isTreeBranch(node) && isOpen(node)}
			{@const selected = controller.isSelected(node.value)}
			{@const siblings = source.siblingsOf(node.value).length}
			<div
				id={rowId(index)}
				role="treeitem"
				tabindex="-1"
				class="oito2-tree-view-row"
				aria-level={entry.depth + 1}
				aria-setsize={siblings}
				aria-posinset={(entry.indexPath.at(-1) ?? 0) + 1}
				aria-expanded={isTreeBranch(node) ? open : undefined}
				aria-selected={controller.selectionMode === 'none' ? undefined : selected}
				aria-checked={checkable ? checkState(node.value) : undefined}
				aria-disabled={node.disabled || undefined}
				aria-busy={loading.has(node.value) || undefined}
				data-selected={selected ? '' : undefined}
				data-active={focused && active === node.value ? '' : undefined}
				data-disabled={node.disabled ? '' : undefined}
				style:top="{index * row}px"
				style:padding-inline-start="calc(var(--oito2-space-xs) + {entry.depth} * var(--oito2-tree-indent))"
				onmousedown={(event) => event.preventDefault()}
				onclick={(event) => onRowClick(event, node)}
				onkeydown={() => {}}
				ondblclick={() => {
					if (!node.disabled) primary(node);
				}}
			>
				<span class="oito2-tree-view-disclosure">
					{#if isTreeBranch(node)}
						{#if loading.has(node.value)}
							<CircularProgress
								size={14}
								strokeWidth={2}
								label={locale.strings.loading}
							/>
						{:else}
							<span
								class="oito2-tree-view-chevron"
								data-state={open ? 'open' : 'closed'}
								data-filtering={filtering ? '' : undefined}
								aria-hidden="true"
								onclick={(event) => {
									event.stopPropagation();
									void setExpanded(node, !open);
								}}
								ondblclick={(event) => event.stopPropagation()}
							>
								<ChevronRight />
							</span>
						{/if}
					{/if}
				</span>
				{#if checkable}
					<span
						class="oito2-tree-view-check oito2-toggle-host"
						data-disabled={node.disabled ? '' : undefined}
						aria-hidden="true"
						onclick={(event) => {
							event.stopPropagation();
							if (!node.disabled) controller.toggleChecked(collection, node.value);
						}}
						ondblclick={(event) => event.stopPropagation()}
					>
						<CheckboxMark checked={checkState(node.value)} />
					</span>
				{/if}
				{#if icon}<span class="oito2-tree-view-icon">{@render icon(node, open)}</span>{/if}
				<span class="oito2-tree-view-label">
					{#if renaming === node.value}
						<input
							class="oito2-tree-view-rename"
							value={treeNodeLabel(node)}
							aria-label={treeNodeLabel(node)}
							{@attach renameField}
							onmousedown={(event) => event.stopPropagation()}
							onclick={(event) => event.stopPropagation()}
							ondblclick={(event) => event.stopPropagation()}
							onkeydown={(event) => {
								event.stopPropagation();
								if (event.key === 'Enter') {
									event.preventDefault();
									finishRename(node, event.currentTarget.value.trim());
								} else if (event.key === 'Escape') {
									event.preventDefault();
									finishRename(node, null);
								}
							}}
							onblur={(event) => finishRename(node, event.currentTarget.value.trim())}
						/>
					{:else if item}
						{@render item(node)}
					{:else if filtering}
						<HighlightedText text={treeNodeLabel(node)} query={trimmedQuery} />
					{:else}
						{treeNodeLabel(node)}
					{/if}
				</span>
			</div>
		{/each}
	</div>
</div>

<style>
	@layer oito2 {
		.oito2-tree-view {
			position: relative;
			box-sizing: border-box;
			overflow: auto;
			padding-block: 4px;
			outline: none;
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
		}

		.oito2-tree-view-rows {
			position: relative;
		}

		.oito2-tree-view-row {
			position: absolute;
			inset-inline: var(--oito2-space-xs);
			box-sizing: border-box;
			display: flex;
			align-items: center;
			gap: var(--oito2-space-xs);
			height: var(--oito2-tree-row-height);
			padding-inline-end: var(--oito2-space-sm);
			border-radius: var(--oito2-radius-small);
			cursor: pointer;
			user-select: none;
			--oito2-icon-size: 16px;
		}

		.oito2-tree-view-row:hover:not([data-selected], [data-disabled]) {
			background: color-mix(in srgb, var(--oito2-color-on-surface) 6%, transparent);
		}

		.oito2-tree-view-row[data-selected] {
			background: var(--oito2-color-selected-fill);
			color: var(--oito2-color-on-selected-fill);
		}

		.oito2-tree-view-row[data-disabled] {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		.oito2-tree-view[data-keyboard] .oito2-tree-view-row[data-active] {
			outline: 2px solid var(--oito2-color-primary-text);
			outline-offset: -2px;
		}

		.oito2-tree-view-disclosure {
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			width: 20px;
		}

		/* The spinner follows the row's text, so it shows on the selected fill too. */
		.oito2-tree-view-row[data-selected] .oito2-tree-view-disclosure :global(.arc) {
			stroke: currentColor;
		}

		.oito2-tree-view-row[data-selected] .oito2-tree-view-disclosure :global(.track) {
			stroke: color-mix(in srgb, currentColor 30%, transparent);
		}

		.oito2-tree-view-chevron {
			display: inline-flex;
			cursor: pointer;
			transition: transform 150ms ease;
		}

		.oito2-tree-view-chevron :global(svg) {
			width: 16px;
			height: 16px;
		}

		.oito2-tree-view-chevron[data-state='open'] {
			transform: rotate(90deg);
		}

		.oito2-tree-view-chevron[data-filtering] {
			cursor: default;
		}

		.oito2-tree-view:dir(rtl) .oito2-tree-view-chevron {
			transform: scaleX(-1);
		}

		.oito2-tree-view:dir(rtl) .oito2-tree-view-chevron[data-state='open'] {
			transform: scaleX(-1) rotate(90deg);
		}

		.oito2-tree-view-check {
			display: inline-flex;
			flex: none;
		}

		.oito2-tree-view-icon {
			display: inline-flex;
			flex: none;
		}

		.oito2-tree-view-icon :global(svg) {
			width: 16px;
			height: 16px;
		}

		.oito2-tree-view-label {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}

		.oito2-tree-view-rename {
			box-sizing: border-box;
			width: 100%;
			padding: 2px var(--oito2-space-xs);
			border: 1px solid var(--oito2-color-primary-text);
			border-radius: var(--oito2-radius-small);
			background: var(--oito2-color-surface-container-lowest);
			color: var(--oito2-color-on-surface);
			font: inherit;
			letter-spacing: inherit;
			outline: none;
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-tree-view-chevron {
				transition: none;
			}
		}
	}
</style>
