// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Public API of @oito2/ui.

// Tokens
export {
	neutralPalettes,
	radius,
	sizes,
	spacing,
	statusPalettes,
	surfacesOf,
	typography,
	type NeutralPalette,
	type StatusPalette,
	type TextStyle,
	type TextStyleName
} from './tokens/values.js';

// Foundation
export { formatHex, parseHex, type Rgba } from './foundation/color.js';
export {
	desktopEnvironments,
	detectDesktopEnvironment,
	type DesktopEnvironment,
	type DesktopEnvironmentSources
} from './foundation/desktop-environment.js';
export {
	Platform,
	detectOperatingSystem,
	isTauriWebview,
	operatingSystems,
	type Density,
	type OperatingSystem
} from './foundation/platform.js';
export {
	WindowButtonLayout,
	resolveWindowControlStyle,
	windowControlStyles,
	type WindowButton,
	type WindowControlStyle
} from './foundation/window-button-layout.js';
export { fallbackSystemSettings, type SystemSettings } from './foundation/system-settings.js';
export {
	setSystemSettings,
	useSystemSettings,
	type SystemSettingsRef
} from './foundation/system-scope.js';
export { default as SystemScope } from './foundation/SystemScope.svelte';

// Localization and formatting
export { en } from './l10n/en.js';
export { ptBR } from './l10n/pt-br.js';
export { timeUnits, type Localizations, type TimeUnit } from './l10n/localizations.js';
export {
	localizationsFor,
	setLocale,
	supportedLocales,
	useLocale,
	type LocaleRef
} from './l10n/locale.js';
export { default as LocaleProvider } from './l10n/LocaleProvider.svelte';
export { Format, useFormat, type ByteUnits, type FormatRef } from './format/format.js';

// Color themes
export * from './theme/index.js';
export { setTheme, useTheme, type ThemeRef } from './theme/theme-context.js';
export { default as ThemeProvider } from './theme/ThemeProvider.svelte';

export {
	ListCollection,
	type ListCollectionOptions,
	type ListGroup
} from './collections/list-collection.js';
export {
	TreeCollection,
	isTreeBranch,
	treeNodeLabel,
	type TreeEntry,
	type TreeNode
} from './collections/tree-collection.js';
export {
	SelectionController,
	type SelectionControllerOptions,
	type SelectionMode
} from './collections/selection-controller.svelte.js';
export {
	AsyncListController,
	type AsyncListControllerOptions,
	type AsyncListPage,
	type AsyncListRequest,
	type SortDescriptor
} from './collections/async-list-controller.svelte.js';

export {
	KeyChord,
	Shortcut,
	usesCommandKey,
	type KeyChordModifiers
} from './shortcuts/shortcut.js';
export {
	availableCommands,
	isCommandEnabled,
	shortcutConflicts,
	useCommands,
	type Command,
	type CommandsRef
} from './shortcuts/commands.js';
export { default as Commands } from './shortcuts/Commands.svelte';

export { focusBorder, type FocusBorderOptions } from './attachments/focus-border.js';
export { edgeFocus, type EdgeFocusOptions } from './attachments/edge-focus.js';
