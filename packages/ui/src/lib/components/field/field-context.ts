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

import { getContext, hasContext, setContext } from 'svelte';

const key = Symbol('oito2.field');

/** What a `Field.Root` tells the label, the control and the messages inside it. */
export interface FieldContext {
	/** The id of the control, which the label points at. */
	readonly controlId: string;
	/** The id of the helper text. */
	readonly helperId: string;
	/** The id of the error message. */
	readonly errorId: string;
	/** Whether the field holds an invalid value. */
	readonly invalid: boolean;
	/** Whether the field can't be used. */
	readonly disabled: boolean;
	/** Whether the field must be filled. */
	readonly required: boolean;
	/** Whether a helper text is rendered. */
	hasHelper: boolean;
	/** Whether an error message is rendered. */
	hasError: boolean;
}

/** Publishes the field context to the parts of a `Field.Root`. */
export function setField(context: FieldContext): void {
	setContext(key, context);
}

/** Returns the context of the enclosing `Field.Root`, or `null` outside one. */
export function useField(): FieldContext | null {
	return hasContext(key) ? getContext<FieldContext>(key) : null;
}

/** Returns the `aria-describedby` value of a field's control: its helper and error ids. */
export function describedBy(field: FieldContext | null, own?: string | null): string | undefined {
	const ids = [
		own,
		field?.hasHelper ? field.helperId : null,
		field?.hasError ? field.errorId : null
	];
	const value = ids.filter(Boolean).join(' ');
	return value === '' ? undefined : value;
}
