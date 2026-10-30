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

export type { IconComponent, IconProps } from './components/icon.js';
export { default as Button } from './components/button/Button.svelte';
export { default as IconButton } from './components/button/IconButton.svelte';
export { default as BackButton } from './components/button/BackButton.svelte';
export { default as CloseButton } from './components/button/CloseButton.svelte';
export { default as Fab } from './components/button/Fab.svelte';

export { nextCheckedState, type CheckedState } from './components/toggles/toggle-state.js';
export { default as Checkbox } from './components/toggles/Checkbox.svelte';
export { default as Switch } from './components/toggles/Switch.svelte';
export * as RadioGroup from './components/toggles/radio-group/index.js';
export { default as ToggleButton } from './components/toggles/ToggleButton.svelte';
export { default as CheckButton } from './components/toggles/CheckButton.svelte';
export { default as RadioButton } from './components/toggles/RadioButton.svelte';
export { default as SwitchButton } from './components/toggles/SwitchButton.svelte';
export { default as CheckboxListTile } from './components/toggles/CheckboxListTile.svelte';
export { default as RadioListTile } from './components/toggles/RadioListTile.svelte';
export { default as SwitchListTile } from './components/toggles/SwitchListTile.svelte';
export { default as ListTile } from './components/list/ListTile.svelte';

export { default as CircularProgress } from './components/progress/CircularProgress.svelte';
export { default as LinearProgress } from './components/progress/LinearProgress.svelte';

export * as Card from './components/surfaces/card/index.js';
export { default as Chip } from './components/surfaces/Chip.svelte';
export { default as Badge } from './components/surfaces/Badge.svelte';
export { default as Separator } from './components/surfaces/Separator.svelte';

export * as Field from './components/field/field/index.js';
export { default as TextField } from './components/field/TextField.svelte';
export { default as TextArea } from './components/field/TextArea.svelte';
export * as Tooltip from './components/tooltip/index.js';
export * as Dialog from './components/dialog/dialog/index.js';
export { default as AlertDialog } from './components/dialog/AlertDialog.svelte';
export { default as ScrollArea } from './components/scroll/ScrollArea.svelte';
export * as Menu from './components/menu/menu/index.js';
export * as Select from './components/select/select/index.js';
export { default as Slider } from './components/slider/Slider.svelte';
export {
	sliderFraction,
	snapSliderValue,
	type SliderMark
} from './components/slider/slider-math.js';

export {
	defaultWindowState,
	setWindowController,
	useWindowController,
	type WindowController,
	type WindowControllerRef,
	type WindowState
} from './window/window-controller.js';
export {
	titleBarHeight,
	windowControlLabel,
	windowControlWidth,
	type WindowControlLabels,
	type WindowControlType
} from './window/window-control.js';
export { dragRegionAttribute, titleBarGestures } from './window/title-bar-gestures.js';
export { default as WindowScope } from './window/WindowScope.svelte';
export { default as WindowControl } from './window/WindowControl.svelte';
export { default as WindowControls } from './window/WindowControls.svelte';
export { default as TitleBar } from './window/TitleBar.svelte';
export { default as WindowTitleBar } from './window/WindowTitleBar.svelte';
export { default as DialogTitleBar } from './window/DialogTitleBar.svelte';
export { default as HeaderBar } from './window/HeaderBar.svelte';
