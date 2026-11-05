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

import { isTauri } from '@tauri-apps/api/core';
import type { FileTypeGroup, PickedFile } from '../files.js';
import { tauriFilesAdapter } from './tauri.js';
import { webFilesAdapter } from './web.js';

/** The handlers of a drop target: whether files are dragged over it, and the files dropped. */
export interface DropTargetHandlers {
	/** Called with true when files are dragged over the element, and false when they leave or drop. */
	onHover: (dragging: boolean) => void;
	/** Called with the files dropped on the element, directories marked as such. */
	onDrop: (files: PickedFile[]) => void;
}

/**
 * How the file components reach the platform: the file chooser, the "Save as" flow and
 * files dropped from the desktop. `webFilesAdapter` uses the browser and
 * `tauriFilesAdapter` the Tauri dialog and fs plugins.
 */
export interface FilesAdapter {
	/** Whether files dragged from the desktop can be dropped. */
	readonly canDropFiles: boolean;
	/** Whether files can be saved. */
	readonly canSaveFiles: boolean;
	/** Opens the file chooser and returns the chosen files; empty when the user cancels. */
	openFiles(options: {
		accept: readonly FileTypeGroup[];
		multiple: boolean;
	}): Promise<PickedFile[]>;
	/** Saves `bytes` as `fileName`; resolves to false when the user cancels. */
	saveFile(options: {
		fileName: string;
		bytes: Uint8Array;
		mimeType?: string | null;
	}): Promise<boolean>;
	/** Receives files dropped on `element`; returns a function that stops it. */
	dropTarget(element: HTMLElement, handlers: DropTargetHandlers): () => void;
}

let shared: FilesAdapter | null = null;

/** Returns the adapter of the platform: `tauriFilesAdapter` inside Tauri, `webFilesAdapter` in a browser. */
export function defaultFilesAdapter(): FilesAdapter {
	shared ??= isTauri() ? tauriFilesAdapter() : webFilesAdapter();
	return shared;
}
