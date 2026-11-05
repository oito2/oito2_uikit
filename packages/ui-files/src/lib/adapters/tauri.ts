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

import { baseName, mimeTypeOf, type FileTypeGroup, type PickedFile } from '../files.js';
import type { FilesAdapter } from './adapter.js';

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

/** Returns the dialog filters of `groups`: one per group with extensions, named by its label or extensions. */
export function dialogFilters(
	groups: readonly FileTypeGroup[]
): { name: string; extensions: string[] }[] {
	if (groups.some((group) => !group.extensions?.length && !group.mimeTypes?.length)) return [];
	return groups
		.filter((group) => (group.extensions?.length ?? 0) > 0)
		.map((group) => {
			const extensions = (group.extensions ?? []).map((extension) =>
				extension.replace(/^\./, '')
			);
			return { name: group.label ?? extensions.join(', '), extensions };
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
 * no wider scope is needed. The suggested save location is the downloads directory.
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
			/** Whether the physical `position` of the event lies inside the element. */
			const inside = (position: { x: number; y: number }) => {
				const ratio = window.devicePixelRatio || 1;
				const x = position.x / ratio;
				const y = position.y / ratio;
				const box = element.getBoundingClientRect();
				return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
			};
			void (async () => {
				const { getCurrentWebview } = await import('@tauri-apps/api/webview');
				const stop = await getCurrentWebview().onDragDropEvent(async (event) => {
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
					const { stat } = await import('@tauri-apps/plugin-fs');
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
				});
				if (stopped) stop();
				else unlisten = stop;
			})();
			return () => {
				stopped = true;
				unlisten?.();
			};
		}
	};
}
