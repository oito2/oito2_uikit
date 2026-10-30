---
'@oito2/ui': minor
---

Add the interaction infrastructure. Collections: `ListCollection` and `TreeCollection` (immutable, with navigation that skips disabled items, accent-insensitive search and filtering, grouping and tree edits), the reactive `SelectionController` (single or multiple selection with Shift ranges and Control/Command toggles) and `AsyncListController` (paged loading with filter, sort and cancellation). Shortcuts: `KeyChord` and `Shortcut` (`Shortcut.parse('Mod+Shift+P')`, sequences such as `G H`, platform labels such as `⇧⌘P`), the `Commands` scope component, `useCommands()` and `shortcutConflicts`. Attachments: `focusBorder`, a keyboard-only focus ring around a group, and `edgeFocus`, arrow-key focus movement that stops at the group's edges. `ThemeProvider` now also hosts the overlays opened inside it, so they keep its theme.
