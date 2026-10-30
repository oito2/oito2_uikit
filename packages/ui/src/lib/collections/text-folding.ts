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

const accents: Readonly<Record<string, string>> = {
	à: 'a',
	á: 'a',
	â: 'a',
	ã: 'a',
	ä: 'a',
	å: 'a',
	ā: 'a',
	ç: 'c',
	ć: 'c',
	č: 'c',
	è: 'e',
	é: 'e',
	ê: 'e',
	ë: 'e',
	ē: 'e',
	ę: 'e',
	ě: 'e',
	ì: 'i',
	í: 'i',
	î: 'i',
	ï: 'i',
	ī: 'i',
	ñ: 'n',
	ń: 'n',
	ň: 'n',
	ò: 'o',
	ó: 'o',
	ô: 'o',
	õ: 'o',
	ö: 'o',
	ø: 'o',
	ō: 'o',
	ù: 'u',
	ú: 'u',
	û: 'u',
	ü: 'u',
	ū: 'u',
	ů: 'u',
	ý: 'y',
	ÿ: 'y',
	ś: 's',
	š: 's',
	ź: 'z',
	ż: 'z',
	ž: 'z',
	ł: 'l',
	ř: 'r',
	ť: 't',
	ď: 'd',
	ğ: 'g',
	ı: 'i',
	ß: 'ss',
	æ: 'ae',
	œ: 'oe'
};

/**
 * Lower-cases `text` and strips its accents (`Pêra` → `pera`, `Straße` → `strasse`), so
 * searches ignore case and diacritics.
 */
export function foldText(text: string): string {
	return foldTextWithOffsets(text).folded;
}

/**
 * Folds `text` like `foldText` and also returns, for each UTF-16 unit of the folded text,
 * the index of the unit of `text` it came from, followed by `text.length`; it maps a match
 * in the folded text back to the original text.
 */
export function foldTextWithOffsets(text: string): { folded: string; starts: number[] } {
	let folded = '';
	const starts: number[] = [];
	for (let i = 0; i < text.length; i++) {
		for (const unit of text.charAt(i).toLowerCase().split('')) {
			const code = unit.charCodeAt(0);
			// Combining diacritical marks.
			if (code >= 0x0300 && code <= 0x036f) continue;
			const replacement = accents[unit] ?? unit;
			folded += replacement;
			for (let k = 0; k < replacement.length; k++) starts.push(i);
		}
	}
	starts.push(text.length);
	return { folded, starts };
}
