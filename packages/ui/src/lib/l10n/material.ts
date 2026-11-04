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
	/** The label of a search field or of the button that shows one. */
	readonly search: string;
	/** The label of a button that shows the previous page. */
	readonly previousPage: string;
	/** The label of a button that shows the next page. */
	readonly nextPage: string;
	/** The hint of a search field. */
	readonly searchField: string;
	/** The label of a button that empties a text field. */
	readonly clearText: string;
	/** The label of a button that copies to the clipboard. */
	readonly copy: string;
}

const english: MaterialStrings = {
	back: 'Back',
	close: 'Close',
	search: 'Search',
	previousPage: 'Previous page',
	nextPage: 'Next page',
	searchField: 'Search',
	clearText: 'Clear text',
	copy: 'Copy'
};
const portuguese: MaterialStrings = {
	back: 'Voltar',
	close: 'Fechar',
	search: 'Pesquisar',
	previousPage: 'Página anterior',
	nextPage: 'Próxima página',
	searchField: 'Pesquisa',
	clearText: 'Limpar texto',
	copy: 'Copiar'
};

/** The strings of the date and time entries, as Flutter's `MaterialLocalizations` words them. */
export interface DateTimeStrings {
	/** The label of a date field. */
	readonly dateInput: string;
	/** The hint of a date field, the compact date pattern. */
	readonly dateHelp: string;
	/** The error of a date that doesn't parse. */
	readonly invalidDateFormat: string;
	/** The error of a date outside the accepted range. */
	readonly dateOutOfRange: string;
	/** The label of a time field. */
	readonly timeInput: string;
	/** The error of a time that doesn't parse. */
	readonly invalidTime: string;
	/** The morning marker of 12-hour times. */
	readonly am: string;
	/** The afternoon marker of 12-hour times. */
	readonly pm: string;
}

const englishDateTime: DateTimeStrings = {
	dateInput: 'Enter Date',
	dateHelp: 'mm/dd/yyyy',
	invalidDateFormat: 'Invalid format.',
	dateOutOfRange: 'Out of range.',
	timeInput: 'Enter time',
	invalidTime: 'Enter a valid time',
	am: 'AM',
	pm: 'PM'
};
const portugueseDateTime: DateTimeStrings = {
	dateInput: 'Inserir data',
	dateHelp: 'dd/mm/aaaa',
	invalidDateFormat: 'Formato inválido.',
	dateOutOfRange: 'Fora de alcance.',
	timeInput: 'Insira o horário',
	invalidTime: 'Insira um horário válido',
	am: 'AM',
	pm: 'PM'
};

/** Returns the date and time entry strings for `locale`: Portuguese for any `pt` locale, English otherwise. */
export function dateTimeStrings(locale: string): DateTimeStrings {
	return locale.toLowerCase().startsWith('pt') ? portugueseDateTime : englishDateTime;
}

/** Returns the standard button strings for `locale`: Portuguese for any `pt` locale, English otherwise. */
export function materialStrings(locale: string): MaterialStrings {
	return locale.toLowerCase().startsWith('pt') ? portuguese : english;
}
