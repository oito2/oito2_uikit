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

/** The time units of relative times. */
export const timeUnits = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'] as const;

/** A unit of a relative time, such as `minute` in "3 minutes ago". */
export type TimeUnit = (typeof timeUnits)[number];

/**
 * The built-in strings of the oito2 components: window controls, pane and sheet handles,
 * relative times, the command palette, form fields, pickers and file uploads. English
 * (`en`) and Brazilian Portuguese (`ptBR`) ship with the library; a label passed to a
 * component always wins over these strings.
 */
export interface Localizations {
	/** The BCP 47 locale these strings are written for, such as `en` or `pt-BR`. */
	readonly locale: string;
	/** Label of the window button that minimizes the window. */
	readonly minimizeWindow: string;
	/** Label of the window button that maximizes the window. */
	readonly maximizeWindow: string;
	/** Label of the window button that restores a maximized window. */
	readonly restoreWindow: string;
	/** Label of the window button that closes the window. */
	readonly closeWindow: string;
	/** Label of the handle that resizes a side pane. */
	readonly resizePane: string;
	/** Label of the arrow that opens a split button's menu. */
	readonly moreOptions: string;
	/** Tooltip of the arrow that scrolls a chip bar back. */
	readonly scrollBack: string;
	/** Tooltip of the arrow that scrolls a chip bar forward. */
	readonly scrollForward: string;
	/** Label of a page indicator dot: page `page` of `count`, counted from 1. */
	pageOf(page: number, count: number): string;
	/** Label of a segment of a segmented entry: part `part` of `count`, counted from 1. */
	partOf(part: number, count: number): string;
	/** A time so close to now that it reads as "now". */
	readonly justNow: string;
	/** Returns a time `count` `unit`s in the past, such as "3 minutes ago". */
	timeAgo(count: number, unit: TimeUnit): string;
	/** Returns a time `count` `unit`s in the future, such as "in 3 minutes". */
	timeFromNow(count: number, unit: TimeUnit): string;
	/** The hint of the command palette search field. */
	readonly commandPaletteHint: string;
	/** Shown when no command matches the command palette search. */
	readonly noCommandsFound: string;
	/** Shown by a shortcut recorder while it waits for keys. */
	readonly pressShortcut: string;
	/** Shown by a shortcut recorder without a shortcut. */
	readonly noShortcut: string;
	/** Label of the button that clears a recorded shortcut. */
	readonly clearShortcut: string;
	/** Announced when a search or autocomplete finds nothing. */
	readonly noResults: string;
	/** Announced with the number of search or autocomplete results. */
	resultCount(count: number): string;
	/** The label of a button that closes a panel, sheet or card. */
	readonly close: string;
	/** The label of a button that dismisses a notification. */
	readonly dismiss: string;
	/** The accessibility label of the notification area. */
	readonly notifications: string;
	/** The accessibility label of a sheet's resize handle. */
	readonly resizeSheet: string;
	/** The button that returns to the previous step of a tour. */
	readonly tourBack: string;
	/** The button that moves to the next step of a tour. */
	readonly tourNext: string;
	/** The button that finishes a tour on its last step. */
	readonly tourDone: string;
	/** The button that ends a tour before its last step. */
	readonly tourSkip: string;
	/** The position of a tour step, such as "Step 2 of 5". */
	tourProgress(step: number, total: number): string;
	/** The button that shows a hidden password. */
	readonly showPassword: string;
	/** The button that hides a shown password. */
	readonly hidePassword: string;
	/** Warns that Caps Lock is on while typing a password. */
	readonly capsLockOn: string;
	/** The button that raises a number. */
	readonly increase: string;
	/** The button that lowers a number. */
	readonly decrease: string;
	/** The accessibility label of a code entry with `length` characters. */
	codeEntry(length: number): string;
	/** The accessibility value of a rating, such as "3.5 of 5 stars". */
	ratingValue(value: string, max: number): string;
	/** The button that removes `label` from a list, such as a tag. */
	removeItem(label: string): string;
	/** The accessibility hint of a label that can be edited. */
	readonly editText: string;
	/** The hue of a color. */
	readonly hue: string;
	/** The saturation of a color. */
	readonly saturation: string;
	/** The brightness (HSV value) of a color. */
	readonly brightness: string;
	/** The lightness of a color. */
	readonly lightness: string;
	/** The opacity of a color. */
	readonly opacity: string;
	/** The red channel of a color. */
	readonly red: string;
	/** The green channel of a color. */
	readonly green: string;
	/** The blue channel of a color. */
	readonly blue: string;
	/** The saturation and brightness area of a color picker. */
	readonly saturationAndBrightness: string;
	/** The heading of the week number column of a calendar. */
	readonly weekNumberHeading: string;
	/** The accessibility label of a week number. */
	weekNumber(week: number): string;
	/** Announced after a copy to the clipboard. */
	readonly copied: string;
	/** Announced when the platform refuses a copy to the clipboard. */
	readonly copyFailed: string;
	/** The hint of a widget the arrow keys move. */
	readonly moveWithArrowKeys: string;
	/** The tooltip of the button that opens an app's main menu. */
	readonly mainMenu: string;
	/** The accessibility action that moves a widget up. */
	readonly moveUp: string;
	/** The accessibility action that moves a widget down. */
	readonly moveDown: string;
	/** The accessibility action that moves a widget left. */
	readonly moveLeft: string;
	/** The accessibility action that moves a widget right. */
	readonly moveRight: string;
	/** The label of a page button, such as "Page 3". */
	pageNumber(page: number): string;
	/** The label of a page size selector. */
	readonly itemsPerPage: string;
	/** The position of a step, such as "Step 2 of 4". */
	stepOf(step: number, count: number): string;
	/** The state of a finished step. */
	readonly stepCompleted: string;
	/** The state of the current step. */
	readonly stepCurrent: string;
	/** The state of a step that needs attention. */
	readonly stepError: string;
	/** How to remove a focused tag, for assistive technologies. */
	readonly removeTagHint: string;
	/** The prefix of the hexadecimal color field. */
	readonly hexColor: string;
	/** A range of two formatted dates, such as '3/1/2026 – 3/7/2026'. */
	dateRange(start: string, end: string): string;
	/** Label of an information message for assistive technologies. */
	readonly infoInformation: string;
	/** Label of a success message for assistive technologies. */
	readonly infoSuccess: string;
	/** Label of a warning message for assistive technologies. */
	readonly infoWarning: string;
	/** Label of an error message for assistive technologies. */
	readonly infoDanger: string;
	/** Label of an important message for assistive technologies. */
	readonly infoImportant: string;
	/** Announced while content loads. */
	readonly loading: string;
	/** An online presence status. */
	readonly statusOnline: string;
	/** An away presence status. */
	readonly statusAway: string;
	/** A busy presence status. */
	readonly statusBusy: string;
	/** An offline presence status. */
	readonly statusOffline: string;
	/** The label of a bubble standing for `count` hidden items. */
	moreCount(count: number): string;
	/** The accessibility label of a QR code. */
	readonly qrCode: string;
	/** Shown when data doesn't fit in a QR code. */
	readonly qrTooLong: string;
	/** The accessibility label of a signature pad. */
	readonly signature: string;
	/** The placeholder of an empty signature pad. */
	readonly signHere: string;
	/** The state of a signature pad with strokes. */
	readonly signed: string;
	/** The state of something with no content. */
	readonly empty: string;
	/** The button that undoes the last change. */
	readonly undo: string;
	/** The button that removes all content. */
	readonly clear: string;
	/** The accessibility label of an image cropper. */
	readonly imageCropper: string;
	/** The button that turns an image a quarter left. */
	readonly rotateLeft: string;
	/** The button that turns an image a quarter right. */
	readonly rotateRight: string;
	/** The button that mirrors an image. */
	readonly flipHorizontally: string;
	/** The button that enlarges a view. */
	readonly zoomIn: string;
	/** The button that shrinks a view. */
	readonly zoomOut: string;
	/** The button that restores the initial state. */
	readonly reset: string;
	/** The invitation of a file drop zone where files can be dropped. */
	readonly dropFilesHere: string;
	/** The button that opens the file chooser for several files. */
	readonly chooseFiles: string;
	/** The button that opens the file chooser for one file. */
	readonly chooseFile: string;
	/** The file types a file upload accepts, listed in `types`. */
	acceptedFileTypes(types: string): string;
	/** The largest file a file upload accepts, as a formatted `size`. */
	maxFileSizeHint(size: string): string;
	/** Why the file `name` was refused: its type isn't accepted. */
	fileTypeNotAccepted(name: string): string;
	/** Why the file `name` was refused: it is larger than `size`. */
	fileTooLarge(name: string, size: string): string;
	/** Why the file `name` was refused: the upload already holds `max` files. */
	tooManyFiles(name: string, max: number): string;
	/** Why `name` was refused: it is a folder, not a file. */
	folderNotAccepted(name: string): string;
	/** Why the file `name` was refused: its size couldn't be read. */
	fileUnreadable(name: string): string;
	/** The button that saves a file to the device. */
	readonly download: string;
	/** Why a download button is disabled on platforms that can't save files. */
	readonly downloadUnavailable: string;
	/** The label of a button that goes back. */
	readonly back: string;
	/** The label and hint of a search field, and of the button that shows one. */
	readonly searchField: string;
	/** The label of a button that shows the previous page. */
	readonly previousPage: string;
	/** The label of a button that shows the next page. */
	readonly nextPage: string;
	/** The label of a button that empties a text field. */
	readonly clearText: string;
	/** The label of a button that copies to the clipboard. */
	readonly copy: string;
	/** The label of a button that accepts a dialog. */
	readonly ok: string;
	/** The label of a button that dismisses a dialog without acting. */
	readonly cancel: string;
	/** The label of a date field. */
	readonly dateInput: string;
	/** The hint of a date field, the compact date pattern. */
	readonly dateHelp: string;
	/** The error of a date that doesn't parse. */
	readonly invalidDateFormat: string;
	/** The error of a date outside the accepted range. */
	readonly dateOutOfRange: string;
	/** The label of a time field. */
	readonly timeInput: string;
	/** The error of a time that doesn't parse. */
	readonly invalidTime: string;
	/** The morning marker of 12-hour times. */
	readonly am: string;
	/** The afternoon marker of 12-hour times. */
	readonly pm: string;
	/** The label of the button that shows the previous month. */
	readonly previousMonth: string;
	/** The label of the button that shows the next month. */
	readonly nextMonth: string;
	/** The word that marks today in a calendar. */
	readonly today: string;
	/** The name of a date picker. */
	readonly selectDate: string;
	/** The label of the color format chooser of a color picker. */
	readonly colorFormat: string;
	/** The button that returns to the previous step of a stepper. */
	readonly previousStep: string;
	/** The button that moves to the next step of a stepper. */
	readonly nextStep: string;
	/** The name of a code block without a label of its own. */
	readonly code: string;
	/** The label of a zoom slider. */
	readonly zoom: string;
	/** The button that stops the automatic rotation of a carousel. */
	readonly pauseRotation: string;
	/** The button that starts the automatic rotation of a carousel. */
	readonly startRotation: string;
}
