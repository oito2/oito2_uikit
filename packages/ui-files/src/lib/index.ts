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

// Public API of @oito2/ui-files.

export {
	acceptAttribute,
	baseName,
	extensionOf,
	fileMatchesTypes,
	isPreviewableImage,
	mimeTypeOf,
	webFile,
	type FileTypeGroup,
	type PickedFile
} from './files.js';
export {
	FileUploadController,
	type FileRejection,
	type FileUploadControllerOptions,
	type RejectedFile
} from './upload-controller.svelte.js';
export {
	defaultFilesAdapter,
	type DropTargetHandlers,
	type FilesAdapter
} from './adapters/adapter.js';
export { webFilesAdapter } from './adapters/web.js';
export { dialogFilters, pathFile, tauriFilesAdapter } from './adapters/tauri.js';
export { Downloads } from './downloads.js';
export { default as FileDropZone } from './FileDropZone.svelte';
export { default as FileUpload } from './FileUpload.svelte';
export { default as DownloadTrigger } from './DownloadTrigger.svelte';
