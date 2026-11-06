🌐 [Português](../../pt-br/architecture/interaction-primitives.md) | **English** | 🏠 [Index](../index.md)

---

# Interaction primitives

The components of `@oito2/ui` do not re-implement focus, dismissal or positioning one by one. They build on a small set of internal primitives in `packages/ui/src/lib/internal/`, on public collection and selection classes, and on the shortcut system. This page describes them for contributors.

The internal primitives are **not exported** from the package: they can change without a major version. Behavior follows the WAI-ARIA Authoring Practices pattern of each widget.

## Internal primitives (`internal/`)

| File                         | Export                                                                    | Kind               | What it does                                                                                                                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `focus-scope.ts`             | `focusScope(options)`                                                     | Attachment         | Initial focus (`autoFocus`), an optional Tab trap (`trap`) and focus restoration (`restoreFocus`) for dialogs, popovers and menus. Trapping scopes stack; the last one is active.                                                                                              |
| `focus.ts`                   | `isFocusable`, `isTabbable`, `tabbables`, `focusElement`, `activeElement` | Functions          | Tab order rules (positive `tabindex` first, radio groups count once), focusing without scrolling, the focused element across open shadow roots                                                                                                                                 |
| `roving-focus.ts`            | `rovingFocus(options)`                                                    | Attachment         | One Tab stop for a group: arrows, Home and End move between items marked `data-oito2-roving-item`, skipping `data-disabled` ones. `orientation` (`horizontal`, `vertical`, `grid` with `columns`), `loop`, `onFocusItem`. Horizontal arrows follow the text direction.         |
| `typeahead.ts`               | `Typeahead`                                                               | Class              | Finds items by typed letters: characters within 600 ms build one query; repeating a character cycles through matches                                                                                                                                                           |
| `keyboard.ts`                | `navigationIntent`, `directionOf`, `isEditableTarget`, `isPrintableKey`   | Functions          | Maps keys to `next`/`previous`/`first`/`last` per orientation and direction (RTL swaps horizontal arrows); tells typing from navigation                                                                                                                                        |
| `dismissable-layer.ts`       | `dismissableLayer(options)`                                               | Attachment         | Escape, a pointer press outside or (optionally) focus moving outside calls `onDismiss(reason, event)`. Layers stack: only the topmost reacts, and a layer opened from another counts as inside it, even when rendered elsewhere.                                               |
| `floating.ts`                | `floating(reference, options)`                                            | Attachment         | Positions an overlay next to its anchor with `@floating-ui/dom` (`offset`, `flip`, `shift`, `size`, `arrow`, `autoUpdate`) and `position: fixed`. Sets `data-placement` and `--oito2-available-width`/`-height`.                                                               |
| `Portal.svelte`, `portal.ts` | `Portal`, `setPortalTarget`, `usePortalTarget`                            | Component, context | Renders content into `to`, else the closest `ThemeProvider` host, else `document.body`, keeping the contexts of where it is used                                                                                                                                               |
| `presence.svelte.ts`         | `Presence`                                                                | Class              | Keeps an element mounted until its exit animation ends: `present` turns true with `open`, and false after the CSS animation (or at once without one or with reduced motion)                                                                                                    |
| `scroll-lock.ts`             | `lockScroll()`                                                            | Function           | Stops the page from scrolling under a modal, padding the body by the hidden scrollbar's width. Locks nest; returns a release function.                                                                                                                                         |
| `live-region.ts`             | `announce(message, politeness)`                                           | Function           | Makes screen readers read a message (`polite` or `assertive`) without moving focus, through visually hidden live regions                                                                                                                                                       |
| `controllable.svelte.ts`     | `Controllable`                                                            | Class              | Controlled or uncontrolled state: `current` reads the prop when given, the own value otherwise; setting it calls `onChange`                                                                                                                                                    |
| `merge-props.ts`             | `mergeProps(a, b)`                                                        | Function           | Merges the consumer's props with a component's own for one element: handlers of the same name both run, the consumer's first, and the component's is skipped when the consumer called `preventDefault()`; `class`, `style` and `aria-describedby`/`aria-labelledby` are joined |
| `ids.ts`                     | `uniqueId`, `partId`                                                      | Functions          | Ids for elements created by scripts and for the parts of a component (`aria-labelledby` targets); components otherwise use `$props.id()`                                                                                                                                       |
| `sets.ts`                    | `snapshotSet`                                                             | Function           | Immutable set snapshots that reactive classes replace whole, so reads track every change                                                                                                                                                                                       |
| `ResizeHandle.svelte`        | `ResizeHandle`                                                            | Component          | An 8 px focusable divider that resizes the panes beside it by drag, arrow keys and assistive technologies                                                                                                                                                                      |

### How components combine them

An anchored overlay such as `Popover.Content` puts several primitives on one element:

```svelte
<!-- Simplified: the content element of an anchored overlay -->
<Portal>
	{#if presence.present}
		<div
			role="dialog"
			data-state={open ? 'open' : 'closed'}
			{@attach floating(() => trigger, { placement })}
			{@attach dismissableLayer({ onDismiss: () => (open = false) })}
			{@attach focusScope({ restoreFocus: true })}
		>
			{@render children()}
		</div>
	{/if}
</Portal>
```

| Component family                                                       | Primitives                                                                                           |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Dialog`, `Sheet`                                                      | `Portal`, `focusScope` (trap; a sheet only when modal), `dismissableLayer`, `lockScroll`, `Presence` |
| `Popover`, `Menu` (and `ContextMenu`, `Select` through the menu panel) | `Portal`, `floating`, `dismissableLayer`, `focusScope`, `Presence`                                   |
| `Combobox`                                                             | `Portal`, `floating`, `dismissableLayer`, `announce`                                                 |
| `Tooltip`                                                              | `Portal`, `floating`, `Presence`                                                                     |
| `Tour`                                                                 | `Portal`, `floating`, `focusScope`                                                                   |
| `CommandPalette`                                                       | `Portal`, `dismissableLayer`, `focusScope`, `Presence`                                               |
| `Tabs.List`, `RadioGroup`, `SegmentGroup`, `ToggleGroup`               | `rovingFocus`                                                                                        |
| `Menu`, `ListBox`                                                      | `Typeahead`                                                                                          |
| `CopyButton`                                                           | `announce`                                                                                           |
| `PanedView`, `Splitter`, `MasterDetail`                                | `ResizeHandle`                                                                                       |
| Components with `value`/`open`/`checked` state                         | `Controllable`                                                                                       |
| Triggers and parts that add handlers to the consumer's element         | `mergeProps`                                                                                         |

The exact set per component is in its source under `packages/ui/src/lib/components/`.

## Public attachments (`attachments/`)

Four behaviors are exported for apps too:

| Attachment    | What it does                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `focusBorder` | A 2 px ring in the text-safe primary color while the element or one inside it has keyboard focus                         |
| `edgeFocus`   | Moves focus with the arrows by on-screen position inside a group (grids of cards, mixed toolbars), stopping at the edges |
| `draggable`   | Moves an element inside its positioned container with the pointer or the arrow keys                                      |
| `undershoot`  | GTK-style fading shadows at the edges of a scrolling element while more content lies beyond                              |

`focusBorder` and `undershoot` need `base.css` (included in `styles.css`).

## Collections and selection (`collections/`)

| Export                | Purpose                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ListCollection`      | An immutable list with value, label, disabled and group accessors; navigation skips disabled items. Used by `Select`, `Combobox`, `ListBox`, `TagsField`. |
| `TreeCollection`      | An immutable tree of uniquely valued nodes, with lookups and edits for tree views and nested menus                                                        |
| `SelectionController` | Selection modes `none`, `single`, `multiple` with desktop gestures: click, Control/Command click to toggle, Shift click for a range                       |
| `AsyncListController` | Loads a list page by page with filter text and sort; a newer load supersedes a running one and aborts its `signal`                                        |
| `foldText` (internal) | Case- and accent-insensitive matching (`Pêra` → `pera`), with offsets back to the original text for highlighting                                          |

The controllers are `.svelte.ts` classes with reactive state that changes only when the value really changes.

## Shortcuts (`shortcuts/`)

| Export                                                                      | Purpose                                                                                                                                                                                                                |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KeyChord`, `Shortcut`                                                      | A key with modifiers, and sequences of chords. `primary` means Command on Apple systems and Control elsewhere (`usesCommandKey`).                                                                                      |
| `Commands`                                                                  | A scope that runs its commands' shortcuts while focus is inside it (or anywhere with `global`); inner scopes override outer commands with the same id; shortcuts without Control, Alt or Meta are ignored while typing |
| `useCommands`, `availableCommands`, `isCommandEnabled`, `shortcutConflicts` | Read the commands available at a component (as `CommandPalette` lists them) and detect clashing shortcuts                                                                                                              |

## Testing the primitives

The primitives have their own browser tests in `internal/` (`focus.svelte.test.ts`, `layers.svelte.test.ts`) and node tests (`internal.test.ts`), run in Chromium and WebKit. Component tests then check the resulting behavior through roles and keyboard, and run axe on the galleries.
