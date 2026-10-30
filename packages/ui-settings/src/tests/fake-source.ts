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

import type { RawSettings } from '../lib/raw-settings.js';
import type { SettingsSource } from '../lib/source.js';

/** A settings source for tests: `current` answers reads, `emit` simulates a change event. */
export class FakeSettingsSource implements SettingsSource {
	current: RawSettings;
	reads = 0;
	/** When set, reads wait for it before answering. */
	gate: Promise<void> | null = null;
	#listeners = new Set<(raw: RawSettings) => void>();

	constructor(current: RawSettings) {
		this.current = current;
	}

	async read(): Promise<RawSettings> {
		this.reads++;
		const value = this.current;
		if (this.gate) await this.gate;
		return value;
	}

	async subscribe(listener: (raw: RawSettings) => void): Promise<() => void> {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	emit(raw: RawSettings): void {
		this.current = raw;
		for (const listener of this.#listeners) listener(raw);
	}

	get listening(): number {
		return this.#listeners.size;
	}
}
