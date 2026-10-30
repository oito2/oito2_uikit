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

import type { Localizations, TimeUnit } from './localizations.js';

// Returns the count followed by the singular or plural English unit.
function unit(count: number, name: TimeUnit): string {
	return count === 1 ? `1 ${name}` : `${count} ${name}s`;
}

/** The English strings. */
export const en: Localizations = {
	locale: 'en',
	minimizeWindow: 'Minimize',
	maximizeWindow: 'Maximize',
	restoreWindow: 'Restore',
	closeWindow: 'Close',
	resizePane: 'Resize pane',
	moreOptions: 'More options',
	scrollBack: 'Scroll back',
	scrollForward: 'Scroll forward',
	justNow: 'now',
	commandPaletteHint: 'Type a command',
	noCommandsFound: 'No commands found',
	pressShortcut: 'Press a shortcut',
	noShortcut: 'No shortcut',
	clearShortcut: 'Clear shortcut',
	noResults: 'No results',
	close: 'Close',
	dismiss: 'Dismiss',
	notifications: 'Notifications',
	resizeSheet: 'Resize sheet',
	tourBack: 'Back',
	tourNext: 'Next',
	tourDone: 'Done',
	tourSkip: 'Skip tour',
	showPassword: 'Show password',
	hidePassword: 'Hide password',
	capsLockOn: 'Caps Lock is on',
	increase: 'Increase',
	decrease: 'Decrease',
	editText: 'Press Enter to edit',
	hue: 'Hue',
	saturation: 'Saturation',
	brightness: 'Brightness',
	lightness: 'Lightness',
	opacity: 'Opacity',
	red: 'Red',
	green: 'Green',
	blue: 'Blue',
	saturationAndBrightness: 'Saturation and brightness',
	weekNumberHeading: 'Wk',
	copied: 'Copied',
	copyFailed: "Couldn't copy",
	moveWithArrowKeys: 'Use the arrow keys to move it',
	mainMenu: 'Main menu',
	moveUp: 'Move up',
	moveDown: 'Move down',
	moveLeft: 'Move left',
	moveRight: 'Move right',
	itemsPerPage: 'Items per page',
	stepCompleted: 'Completed',
	stepCurrent: 'Current',
	stepError: 'Needs attention',
	removeTagHint: 'Press Delete to remove',
	hexColor: 'Hex',
	infoInformation: 'Information',
	infoSuccess: 'Success',
	infoWarning: 'Warning',
	infoDanger: 'Error',
	infoImportant: 'Important',
	loading: 'Loading',
	statusOnline: 'Online',
	statusAway: 'Away',
	statusBusy: 'Busy',
	statusOffline: 'Offline',
	qrCode: 'QR code',
	qrTooLong: 'Too much data for a QR code',
	signature: 'Signature',
	signHere: 'Sign here',
	signed: 'Signed',
	empty: 'Empty',
	undo: 'Undo',
	clear: 'Clear',
	imageCropper: 'Image cropper',
	rotateLeft: 'Rotate left',
	rotateRight: 'Rotate right',
	flipHorizontally: 'Flip horizontally',
	zoomIn: 'Zoom in',
	zoomOut: 'Zoom out',
	reset: 'Reset',
	dropFilesHere: 'Drop files here',
	chooseFiles: 'Choose files',
	chooseFile: 'Choose a file',
	download: 'Download',
	downloadUnavailable: 'Downloads are not available on this device',
	pageOf: (page, count) => `Page ${page} of ${count}`,
	partOf: (part, count) => `Part ${part} of ${count}`,
	timeAgo: (count, timeUnit) => `${unit(count, timeUnit)} ago`,
	timeFromNow: (count, timeUnit) => `in ${unit(count, timeUnit)}`,
	resultCount: (count) => (count === 1 ? '1 result' : `${count} results`),
	tourProgress: (step, total) => `Step ${step} of ${total}`,
	codeEntry: (length) => `Code of ${length} characters`,
	ratingValue: (value, max) => `${value} of ${max} stars`,
	removeItem: (label) => `Remove ${label}`,
	weekNumber: (week) => `Week ${week}`,
	pageNumber: (page) => `Page ${page}`,
	stepOf: (step, count) => `Step ${step} of ${count}`,
	dateRange: (start, end) => `${start} – ${end}`,
	moreCount: (count) => `${count} more`,
	acceptedFileTypes: (types) => `Accepted: ${types}`,
	maxFileSizeHint: (size) => `Up to ${size} each`,
	fileTypeNotAccepted: (name) => `${name}: this file type is not accepted`,
	fileTooLarge: (name, size) => `${name}: larger than ${size}`,
	tooManyFiles: (name, max) =>
		max === 1 ? `${name}: only 1 file can be added` : `${name}: only ${max} files can be added`,
	folderNotAccepted: (name) => `${name}: folders are not accepted`
};
