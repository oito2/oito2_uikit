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

/** The strings of the standard buttons that `@oito2/ui` labels like Flutter's Material widgets. */
export interface MaterialStrings {
	/** The label of a button that goes back. */
	readonly back: string;
	/** The label of a button that closes a dialog, page or panel. */
	readonly close: string;
}

const english: MaterialStrings = { back: 'Back', close: 'Close' };
const portuguese: MaterialStrings = { back: 'Voltar', close: 'Fechar' };

/** Returns the standard button strings for `locale`: Portuguese for any `pt` locale, English otherwise. */
export function materialStrings(locale: string): MaterialStrings {
	return locale.toLowerCase().startsWith('pt') ? portuguese : english;
}
