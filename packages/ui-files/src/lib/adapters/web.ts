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

import { acceptAttribute, webFile, type PickedFile } from '../files.js';
import type { FilesAdapter } from './adapter.js';

/**
 * Returns the browser adapter: an `<input type="file">` for the file chooser, HTML drag and
 * drop for dropped files (folders marked as directories) and a `Blob` link with `download`
 * for saving, which always reports the file as saved.
 */
export function webFilesAdapter(): FilesAdapter {
	return {
		canDropFiles: true,
		canSaveFiles: true,

		openFiles({ accept, multiple }) {
			return new Promise((resolve) => {
				const input = document.createElement('input');
				input.type = 'file';
				input.multiple = multiple;
				const types = acceptAttribute(accept);
				if (types) input.accept = types;
				input.hidden = true;
				input.dataset.oito2FileInput = '';
				const finish = (files: PickedFile[]) => {
					input.remove();
					resolve(files);
				};
				input.addEventListener(
					'change',
					() => finish([...(input.files ?? [])].map((file) => webFile(file))),
					{
						once: true
					}
				);
				input.addEventListener('cancel', () => finish([]), { once: true });
				document.body.append(input);
				input.click();
			});
		},

		async saveFile({ fileName, bytes, mimeType }) {
			const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
				type: mimeType ?? 'application/octet-stream'
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = fileName;
			link.hidden = true;
			document.body.append(link);
			link.click();
			link.remove();
			setTimeout(() => URL.revokeObjectURL(url), 30_000);
			return true;
		},

		dropTarget(element, { onHover, onDrop }) {
			// Counts the enters and leaves of child elements, so moving over them keeps the hover.
			let depth = 0;
			const hasFiles = (event: DragEvent) =>
				event.dataTransfer?.types.includes('Files') ?? false;
			const onDragEnter = (event: DragEvent) => {
				if (!hasFiles(event)) return;
				event.preventDefault();
				depth++;
				if (depth === 1) onHover(true);
			};
			const onDragOver = (event: DragEvent) => {
				if (!hasFiles(event)) return;
				event.preventDefault();
				if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
			};
			const onDragLeave = (event: DragEvent) => {
				if (!hasFiles(event)) return;
				depth = Math.max(0, depth - 1);
				if (depth === 0) onHover(false);
			};
			const onDropEvent = (event: DragEvent) => {
				if (!hasFiles(event)) return;
				event.preventDefault();
				depth = 0;
				onHover(false);
				const transfer = event.dataTransfer;
				if (!transfer) return;
				const items = [...transfer.items].filter((item) => item.kind === 'file');
				const files: PickedFile[] = [];
				items.forEach((item, index) => {
					const file = item.getAsFile() ?? transfer.files[index];
					if (!file) return;
					const entry = item.webkitGetAsEntry?.();
					files.push(webFile(file, { isDirectory: entry?.isDirectory ?? false }));
				});
				if (files.length === 0)
					for (const file of transfer.files) files.push(webFile(file));
				if (files.length > 0) onDrop(files);
			};
			element.addEventListener('dragenter', onDragEnter);
			element.addEventListener('dragover', onDragOver);
			element.addEventListener('dragleave', onDragLeave);
			element.addEventListener('drop', onDropEvent);
			return () => {
				element.removeEventListener('dragenter', onDragEnter);
				element.removeEventListener('dragover', onDragOver);
				element.removeEventListener('dragleave', onDragLeave);
				element.removeEventListener('drop', onDropEvent);
			};
		}
	};
}
