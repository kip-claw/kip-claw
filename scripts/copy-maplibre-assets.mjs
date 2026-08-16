import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(root, 'node_modules', 'maplibre-gl', 'dist');
const outputDir = join(root, 'static', 'maplibre');
const assets = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];

await mkdir(outputDir, { recursive: true });
await Promise.all(assets.map((asset) => copyFile(join(sourceDir, asset), join(outputDir, asset))));
