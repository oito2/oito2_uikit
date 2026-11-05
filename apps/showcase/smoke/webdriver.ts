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

// Smoke test of the desktop showcase through tauri-driver: starts the debug build, waits for the
// catalogue, opens the Button page and checks that the Tauri bridge is present. Speaks plain W3C
// WebDriver over HTTP, so it needs no client library.
//
// Usage: node smoke/webdriver.ts <application> [tauri-driver arguments...]
// The TAURI_DRIVER environment variable overrides the tauri-driver executable.

import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const [application, ...driverArgs] = process.argv.slice(2);
if (!application) {
	console.error('usage: node smoke/webdriver.ts <application> [tauri-driver arguments...]');
	process.exit(2);
}

const server = 'http://127.0.0.1:4444';
const element = 'element-6066-11e4-a52e-4f735466cecf';

// Sends a WebDriver command and returns its value, throwing on a WebDriver error.
async function command(method: string, path: string, body?: unknown): Promise<unknown> {
	const response = await fetch(`${server}${path}`, {
		method,
		headers: { 'content-type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body)
	});
	const json = (await response.json()) as { value: unknown };
	if (!response.ok) throw new Error(`${method} ${path}: ${JSON.stringify(json.value)}`);
	return json.value;
}

// Calls `probe` until it returns a value other than undefined, or throws after `timeout` ms.
async function poll<T>(
	what: string,
	probe: () => Promise<T | undefined>,
	timeout = 30_000
): Promise<T> {
	const end = Date.now() + timeout;
	let last: unknown;
	while (Date.now() < end) {
		try {
			const value = await probe();
			if (value !== undefined) return value;
		} catch (error) {
			last = error;
		}
		await new Promise((done) => setTimeout(done, 250));
	}
	throw new Error(`timed out waiting for ${what}`, { cause: last });
}

const driver = spawn(process.env.TAURI_DRIVER ?? 'tauri-driver', driverArgs, { stdio: 'inherit' });
let session: string | undefined;

try {
	await poll('tauri-driver', async () => ((await command('GET', '/status')) ? true : undefined));
	const created = (await command('POST', '/session', {
		capabilities: {
			alwaysMatch: {
				browserName: 'wry',
				'tauri:options': { application: resolve(application) }
			}
		}
	})) as { sessionId: string };
	session = created.sessionId;

	// Evaluates `script` in the main window.
	const run = (script: string) =>
		command('POST', `/session/${session}/execute/sync`, { script, args: [] });

	await poll('the catalogue', async () =>
		(await run('return document.querySelector(\'a[href$="/button"]\') !== null;'))
			? true
			: undefined
	);
	if (!(await run("return '__TAURI_INTERNALS__' in window;"))) {
		throw new Error('the Tauri bridge is missing');
	}

	const link = (await command('POST', `/session/${session}/element`, {
		using: 'css selector',
		value: 'a[href$="/button"]'
	})) as Record<string, string>;
	await command('POST', `/session/${session}/element/${link[element]}/click`, {});
	const heading = await poll('the Button page', async () => {
		const text = (await run(
			"return document.querySelector('h1')?.textContent?.trim() ?? '';"
		)) as string;
		return text === 'Button' ? text : undefined;
	});
	console.log(`smoke test passed: opened the ${heading} page`);
} catch (error) {
	console.error(error);
	process.exitCode = 1;
} finally {
	if (session) await command('DELETE', `/session/${session}`).catch(() => {});
	driver.kill();
}
