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

import { Platform } from '@oito2/ui';
import {
	baseName,
	extensionsForMimeType,
	mimeTypeOf,
	type FileTypeGroup,
	type PickedFile
} from '../files.js';
import type { FilesAdapter } from './adapter.js';

/** Converts a drag-drop position to CSS pixels: wry reports physical pixels on Windows only. */
export function dropPositionToCss(
	position: { x: number; y: number },
	isWindows: boolean,
	ratio: number
): { x: number; y: number } {
	const scale = isWindows ? ratio || 1 : 1;
	return { x: position.x / scale, y: position.y / scale };
}

/** Returns a `PickedFile` for the file system `path`; `isDirectory` marks a folder. */
export function pathFile(path: string, options: { isDirectory?: boolean } = {}): PickedFile {
	return {
		name: baseName(path),
		path,
		mimeType: mimeTypeOf(path),
		isDirectory: options.isDirectory ?? false,
		size: async () => {
			const { stat } = await import('@tauri-apps/plugin-fs');
			return (await stat(path)).size;
		},
		bytes: async () => {
			const { readFile } = await import('@tauri-apps/plugin-fs');
			return readFile(path);
		}
	};
}

/**
 * Returns the dialog filters of `groups`: one per group, named by its label or extensions,
 * with the group's extensions and those the built-in table maps to its MIME types. A group
 * that yields no extension is left out, and a group without filters yields no filter at all.
 */
export function dialogFilters(
	groups: readonly FileTypeGroup[]
): { name: string; extensions: string[] }[] {
	if (groups.some((group) => !group.extensions?.length && !group.mimeTypes?.length)) return [];
	return groups.flatMap((group) => {
		const extensions = [
			...new Set([
				...(group.extensions ?? []).map((extension) => extension.replace(/^\./, '')),
				...(group.mimeTypes ?? []).flatMap(extensionsForMimeType)
			])
		];
		if (extensions.length === 0) return [];
		return [{ name: group.label ?? extensions.join(', '), extensions }];
	});
}

/**
 * Returns the Tauri adapter: the file chooser and "Save as" dialogs of the dialog plugin,
 * file sizes and contents read and written through the fs plugin, and files dropped on the
 * window from the webview's drag and drop events, kept to those over the element.
 *
 * The app registers `tauri-plugin-dialog` and `tauri-plugin-fs` and grants
 * `dialog:allow-open`, `dialog:allow-save`, `fs:allow-stat`, `fs:allow-read-file` and
 * `fs:allow-write-file`; both plugins add the chosen and dropped paths to the fs scope, so
 * no wider scope is needed. A dropped folder is added to the fs plugin's runtime scope
 * recursively (its `scopeDroppedPaths` option, on by default) even though
 * `FileUploadController` refuses it; an app that never accepts folders can set
 * `plugins.fs.scopeDroppedPaths` to `false` and grant an explicit `fs:scope` instead. The
 * suggested save location is the downloads directory.
 */
export function tauriFilesAdapter(): FilesAdapter {
	return {
		canDropFiles: true,
		canSaveFiles: true,

		async openFiles({ accept, multiple }) {
			const { open } = await import('@tauri-apps/plugin-dialog');
			const filters = dialogFilters(accept);
			const chosen = await open({
				multiple,
				directory: false,
				...(filters.length ? { filters } : {})
			});
			if (chosen === null) return [];
			return (Array.isArray(chosen) ? chosen : [chosen]).map((path) => pathFile(path));
		},

		async saveFile({ fileName, bytes }) {
			const [{ save }, { writeFile }, { downloadDir, join }] = await Promise.all([
				import('@tauri-apps/plugin-dialog'),
				import('@tauri-apps/plugin-fs'),
				import('@tauri-apps/api/path')
			]);
			let defaultPath = fileName;
			try {
				defaultPath = await join(await downloadDir(), fileName);
			} catch {
				// Without a downloads directory the dialog starts where the system chooses.
			}
			const path = await save({ defaultPath });
			if (path === null) return false;
			await writeFile(path, bytes);
			return true;
		},

		dropTarget(element, { onHover, onDrop }) {
			let stopped = false;
			let unlisten: (() => void) | null = null;
			let hovering = false;
			const hover = (dragging: boolean) => {
				if (dragging !== hovering) {
					hovering = dragging;
					onHover(dragging);
				}
			};
			const isWindows = Platform.current().isWindows;
			/** Whether the `position` of the event, converted to CSS pixels, lies inside the element. */
			const inside = (position: { x: number; y: number }) => {
				const { x, y } = dropPositionToCss(position, isWindows, window.devicePixelRatio);
				const box = element.getBoundingClientRect();
				return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
			};
			(async () => {
				const [{ getCurrentWebview }, { stat }] = await Promise.all([
					import('@tauri-apps/api/webview'),
					import('@tauri-apps/plugin-fs')
				]);
				const stop = await getCurrentWebview().onDragDropEvent(async (event) => {
					try {
						const payload = event.payload;
						if (payload.type === 'leave') {
							hover(false);
							return;
						}
						const over = inside(payload.position);
						if (payload.type !== 'drop') {
							hover(over);
							return;
						}
						hover(false);
						if (!over) return;
						const files: PickedFile[] = [];
						for (const path of payload.paths) {
							try {
								files.push(
									pathFile(path, { isDirectory: (await stat(path)).isDirectory })
								);
							} catch {
								// A dragged item that isn't on the file system is skipped.
							}
						}
						if (files.length > 0) onDrop(files);
					} catch (error) {
						console.error('oito2: could not handle the dropped files', error);
					}
				});
				if (stopped) stop();
				else unlisten = stop;
			})().catch((error) => console.error('oito2: drop target unavailable', error));
			return () => {
				stopped = true;
				unlisten?.();
			};
		}
	};
}
