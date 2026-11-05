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

import qrcode from 'qrcode-generator';

/**
 * How much of a QR code can be damaged or covered and still read, as error correction data
 * takes more room: about 7% (`low`), 15% (`medium`), 25% (`quartile`) or 30% (`high`).
 */
export type QrErrorLevel = 'low' | 'medium' | 'quartile' | 'high';

/** The error levels, from the least to the most error correction. */
export const qrErrorLevels: readonly QrErrorLevel[] = ['low', 'medium', 'quartile', 'high'];

const levelCodes = { low: 'L', medium: 'M', quartile: 'Q', high: 'H' } as const;

/** The dark modules of a QR code, as a square grid. */
export interface QrModules {
	/** The number of modules on each side, without the quiet zone. */
	readonly moduleCount: number;
	/** `modules[row][column]` is true for a dark module. */
	readonly modules: readonly (readonly boolean[])[];
}

const numeric = /^[0-9]+$/;
const alphanumeric = /^[-0-9A-Z $%*+./:]+$/;

/**
 * Returns the dark modules of the QR code of `data` in the smallest version that holds it
 * at `errorLevel`, choosing the encoding as oito2_ui does: digits only in numeric mode,
 * upper-case letters, digits and ` $%*+-./:` in alphanumeric mode, and anything else as
 * UTF-8 bytes. Throws a `RangeError` when `data` doesn't fit in a QR code at that level.
 */
export function qrModules(data: string, errorLevel: QrErrorLevel = 'medium'): QrModules {
	const code = qrcode(0, levelCodes[errorLevel]);
	if (numeric.test(data)) code.addData(data, 'Numeric');
	else if (alphanumeric.test(data)) code.addData(data, 'Alphanumeric');
	else code.addData(utf8Bytes(data), 'Byte');
	try {
		code.make();
	} catch (error) {
		throw new RangeError(`data doesn't fit in a QR code: ${String(error)}`, { cause: error });
	}
	const count = code.getModuleCount();
	const modules = Array.from({ length: count }, (_, row) =>
		Object.freeze(Array.from({ length: count }, (_, col) => code.isDark(row, col)))
	);
	return Object.freeze({ moduleCount: count, modules: Object.freeze(modules) });
}

/** Returns `text` as a string of UTF-8 bytes, one character per byte, which the encoder reads as is. */
function utf8Bytes(text: string): string {
	let bytes = '';
	for (const byte of new TextEncoder().encode(text)) bytes += String.fromCharCode(byte);
	return bytes;
}

/** The width of the quiet zone around a QR code, in modules. */
export const qrQuietZone = 4;

/**
 * Returns the SVG path data of the dark modules of `qr` on a grid of one unit per module,
 * offset by the quiet zone, leaving out the modules under a centered square `hole` (a
 * fraction of the module area's width, 0 for none). With `rounded` the modules are rounded
 * squares; otherwise squares, slightly enlarged to hide hairline seams.
 */
export function qrPath(qr: QrModules, options: { rounded?: boolean; hole?: number } = {}): string {
	const { rounded = false, hole = 0 } = options;
	const count = qr.moduleCount;
	const center = qrQuietZone + count / 2;
	const half = (count * hole) / 2;
	const f = (n: number) => String(Math.round(n * 1000) / 1000);
	let d = '';
	for (let row = 0; row < count; row++) {
		for (let col = 0; col < count; col++) {
			if (!qr.modules[row]?.[col]) continue;
			const x = col + qrQuietZone;
			const y = row + qrQuietZone;
			// A module whose inner 80% touches the hole is left out.
			if (
				hole > 0 &&
				x + 0.9 > center - half &&
				x + 0.1 < center + half &&
				y + 0.9 > center - half &&
				y + 0.1 < center + half
			)
				continue;
			if (rounded) {
				const inset = 0.06;
				const r = 0.32;
				const size = 1 - inset * 2;
				const left = x + inset;
				const top = y + inset;
				d +=
					`M${f(left + r)} ${f(top)}h${f(size - 2 * r)}a${r} ${r} 0 0 1 ${r} ${r}` +
					`v${f(size - 2 * r)}a${r} ${r} 0 0 1 -${r} ${r}h${f(-(size - 2 * r))}` +
					`a${r} ${r} 0 0 1 -${r} -${r}v${f(-(size - 2 * r))}a${r} ${r} 0 0 1 ${r} -${r}z`;
			} else {
				const grow = 0.02;
				d += `M${f(x - grow)} ${f(y - grow)}h${f(1 + 2 * grow)}v${f(1 + 2 * grow)}h${f(-1 - 2 * grow)}z`;
			}
		}
	}
	return d;
}
