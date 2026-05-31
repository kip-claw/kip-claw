#!/usr/bin/env node

import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const sourcePath = process.env.SOUL_SOURCE || '/home/kip/.openclaw/workspace/SOUL.md';
const targetPath = path.resolve('src/routes/soul/soul.md');

try {
	await mkdir(path.dirname(targetPath), { recursive: true });
	await copyFile(sourcePath, targetPath);
	console.log(`Synced SOUL markdown:\n  from: ${sourcePath}\n  to:   ${targetPath}`);
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`Failed to sync SOUL markdown: ${message}`);
	process.exit(1);
}
