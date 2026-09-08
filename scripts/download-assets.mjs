import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const { origin, assets } = JSON.parse(await readFile(new URL('./assets.json', import.meta.url), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
console.log('Downloading third-party Apple demo assets, which are not covered by the code MIT license. See THIRD_PARTY_NOTICES.md.');
for (const asset of assets) {
  const destination = join(root, 'public', asset.file);
  const existing = await readFile(destination).catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (existing && hash(existing) === asset.sha256) {
    console.log(`Already present: ${asset.file}`);
    continue;
  }
  const response = await fetch(`${origin}/${asset.file}`, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Unable to download ${asset.file}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (hash(bytes) !== asset.sha256) throw new Error(`Asset checksum changed: ${asset.file}. Check the source before updating scripts/assets.json.`);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(`${destination}.download`, bytes);
  await rename(`${destination}.download`, destination);
  console.log(`Downloaded: ${asset.file}`);
}
