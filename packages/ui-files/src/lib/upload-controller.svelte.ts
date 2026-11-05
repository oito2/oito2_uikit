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

import { fileMatchesTypes, type FileTypeGroup, type PickedFile } from './files.js';

/** Why a `FileUploadController` refused a file: its type, its size, the file count, or because it is a directory. */
export type FileRejection = 'type' | 'size' | 'count' | 'directory';

/** A file a `FileUploadController` refused, with the reason. */
export interface RejectedFile {
	readonly file: PickedFile;
	readonly reason: FileRejection;
}

/** The options of a `FileUploadController`. */
export interface FileUploadControllerOptions {
	/** The accepted file types; empty accepts every file. */
	accept?: readonly FileTypeGroup[];
	/** The largest number of files; no limit when left out. */
	maxFiles?: number | null;
	/** The largest file size in bytes; no limit when left out. */
	maxFileSize?: number | null;
	/** The files held at first, unchecked. */
	files?: Iterable<PickedFile>;
}

/**
 * The files of a file upload, checked against the `accept`ed types, `maxFileSize` and
 * `maxFiles` as they are added; directories are always refused.
 *
 * Its state is reactive. `add` keeps the files that pass the checks and lists the others in
 * `rejected`, which holds the refusals of the last `add` only.
 */
export class FileUploadController {
	/** The accepted file types; empty accepts every file. */
	readonly accept: readonly FileTypeGroup[];
	/** The largest number of files, or `null` for no limit. */
	readonly maxFiles: number | null;
	/** The largest file size in bytes, or `null` for no limit. */
	readonly maxFileSize: number | null;

	#files: readonly PickedFile[] = $state.raw([]);
	#rejected: readonly RejectedFile[] = $state.raw([]);
	#queue: Promise<void> = Promise.resolve();
	#disposed = false;

	/** Creates a controller. Throws a `RangeError` when `maxFiles` or `maxFileSize` isn't positive. */
	constructor(options: FileUploadControllerOptions = {}) {
		const { maxFiles = null, maxFileSize = null } = options;
		if (maxFiles !== null && !(maxFiles > 0))
			throw new RangeError(`maxFiles must be positive: ${maxFiles}`);
		if (maxFileSize !== null && !(maxFileSize > 0))
			throw new RangeError(`maxFileSize must be positive: ${maxFileSize}`);
		this.accept = Object.freeze([...(options.accept ?? [])]);
		this.maxFiles = maxFiles;
		this.maxFileSize = maxFileSize;
		this.#files = Object.freeze([...(options.files ?? [])]);
	}

	/** The accepted files, in the order they were added. */
	get files(): readonly PickedFile[] {
		return this.#files;
	}

	/** The files refused by the last `add`. */
	get rejected(): readonly RejectedFile[] {
		return this.#rejected;
	}

	/** Whether more files can be added. */
	get canAddMore(): boolean {
		return this.maxFiles === null || this.#files.length < this.maxFiles;
	}

	/**
	 * Adds the files of `incoming` that pass the checks, in order, and lists the others in
	 * `rejected`. Reading the size of each file can take a moment, so this resolves once
	 * every file is checked; a call made before an earlier one resolves waits for it, so the
	 * limits hold across both. Nothing changes once the controller is disposed.
	 */
	add(incoming: Iterable<PickedFile>): Promise<void> {
		const files = [...incoming];
		const next = this.#queue.then(() => this.#add(files));
		this.#queue = next.catch(() => {});
		return next;
	}

	async #add(incoming: readonly PickedFile[]): Promise<void> {
		const added: PickedFile[] = [];
		const rejected: RejectedFile[] = [];
		for (const file of incoming) {
			let reason: FileRejection | null = null;
			if (file.isDirectory) reason = 'directory';
			else if (!fileMatchesTypes(file, this.accept)) reason = 'type';
			else if (this.maxFileSize !== null && (await file.size()) > this.maxFileSize)
				reason = 'size';
			else if (this.maxFiles !== null && this.#files.length + added.length >= this.maxFiles)
				reason = 'count';
			if (reason === null) added.push(file);
			else rejected.push({ file, reason });
		}
		if (this.#disposed) return;
		this.#files = Object.freeze([...this.#files, ...added]);
		this.#rejected = Object.freeze(rejected);
	}

	/** Removes `file`, if the controller holds it. */
	remove(file: PickedFile): void {
		if (!this.#files.includes(file)) return;
		this.#files = Object.freeze(this.#files.filter((held) => held !== file));
	}

	/** Removes every file and refusal. */
	clear(): void {
		if (this.#files.length > 0) this.#files = Object.freeze([]);
		if (this.#rejected.length > 0) this.#rejected = Object.freeze([]);
	}

	/** Forgets the refusals of the last `add`. */
	clearRejected(): void {
		if (this.#rejected.length > 0) this.#rejected = Object.freeze([]);
	}

	/** Stops the controller: additions still being checked are dropped. */
	dispose(): void {
		this.#disposed = true;
	}
}
