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

/**
 * A file the user chose or dropped: a browser `File` on the web, a path on the file system
 * in Tauri. Its size and content are read on demand.
 */
export interface PickedFile {
	/** The file name with its extension, without the directories. */
	readonly name: string;
	/** The path on the file system, in Tauri; `null` on the web. */
	readonly path: string | null;
	/** The MIME type, such as `image/png`, or `null` when unknown. */
	readonly mimeType: string | null;
	/** Whether the item is a directory, which a `FileUploadController` refuses. */
	readonly isDirectory: boolean;
	/** The browser file, on the web. */
	readonly file?: File;
	/** Returns the size in bytes. */
	size(): Promise<number>;
	/** Returns the content. */
	bytes(): Promise<Uint8Array>;
}

/**
 * A group of accepted file types, such as "Images": files whose name ends with one of
 * `extensions` (with or without the dot, in any letter case) or whose MIME type is one of
 * `mimeTypes`, where `image/*` matches every image type. A group with neither accepts
 * every file.
 */
export interface FileTypeGroup {
	/** The name shown in file choosers and hints, such as `Images`. */
	readonly label?: string;
	/** The file extensions, such as `png` or `.jpg`. */
	readonly extensions?: readonly string[];
	/** The MIME types, such as `application/pdf` or `image/*`. */
	readonly mimeTypes?: readonly string[];
}

/** Returns the lower-case extension of `name` without the dot, or `null` when it has none. */
export function extensionOf(name: string): string | null {
	const lower = name.toLowerCase();
	const dot = lower.lastIndexOf('.');
	return dot < 0 ? null : lower.slice(dot + 1);
}

/** Returns the last segment of `path`, split at `/` or `\`. */
export function baseName(path: string): string {
	const parts = path.split(/[\\/]/).filter((part) => part !== '');
	return parts.at(-1) ?? path;
}

const mimeTypes: Readonly<Record<string, string>> = {
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	webp: 'image/webp',
	bmp: 'image/bmp',
	svg: 'image/svg+xml',
	avif: 'image/avif',
	pdf: 'application/pdf',
	json: 'application/json',
	zip: 'application/zip',
	txt: 'text/plain',
	md: 'text/markdown',
	csv: 'text/csv',
	html: 'text/html',
	css: 'text/css',
	js: 'text/javascript',
	mp3: 'audio/mpeg',
	wav: 'audio/wav',
	ogg: 'audio/ogg',
	mp4: 'video/mp4',
	webm: 'video/webm'
};

/** Returns the MIME type of a common file extension in `name`, or `null`. */
export function mimeTypeOf(name: string): string | null {
	const extension = extensionOf(name);
	return (
		(extension !== null && Object.hasOwn(mimeTypes, extension) ? mimeTypes[extension] : null) ??
		null
	);
}

/**
 * Whether `file` is one of the `accept`ed types: no groups, or a group without extensions
 * and MIME types, accept every file.
 */
export function fileMatchesTypes(file: PickedFile, accept: readonly FileTypeGroup[]): boolean {
	if (accept.length === 0) return true;
	const extension = extensionOf(file.name);
	const mime = file.mimeType?.toLowerCase() ?? null;
	const mimeMatches = (pattern: string) => {
		const wanted = pattern.toLowerCase();
		if (mime === null) return false;
		return wanted.endsWith('/*') ? mime.startsWith(wanted.slice(0, -1)) : mime === wanted;
	};
	for (const group of accept) {
		const extensions = group.extensions ?? [];
		const types = group.mimeTypes ?? [];
		if (extensions.length === 0 && types.length === 0) return true;
		if (extensions.some((wanted) => wanted.toLowerCase().replace(/^\./, '') === extension))
			return true;
		if (types.some(mimeMatches)) return true;
	}
	return false;
}

/** Returns the `accept` attribute of a file input for `groups`: their extensions with a dot and their MIME types. */
export function acceptAttribute(groups: readonly FileTypeGroup[]): string | undefined {
	if (groups.some((group) => !group.extensions?.length && !group.mimeTypes?.length))
		return undefined;
	const values = groups.flatMap((group) => [
		...(group.extensions ?? []).map((extension) => `.${extension.replace(/^\./, '')}`),
		...(group.mimeTypes ?? [])
	]);
	return values.length === 0 ? undefined : values.join(',');
}

/** Returns a `PickedFile` for a browser `file`; `isDirectory` marks a dropped folder. */
export function webFile(file: File, options: { isDirectory?: boolean } = {}): PickedFile {
	return {
		name: file.name,
		path: null,
		mimeType: file.type || mimeTypeOf(file.name),
		isDirectory: options.isDirectory ?? false,
		file,
		size: () => Promise.resolve(file.size),
		bytes: async () => new Uint8Array(await file.arrayBuffer())
	};
}

/** Whether `file` is an image a browser shows, by MIME type or extension; SVG files are left out. */
export function isPreviewableImage(file: PickedFile): boolean {
	const mime = file.mimeType ?? mimeTypeOf(file.name);
	return mime !== null && mime.startsWith('image/') && mime !== 'image/svg+xml';
}
